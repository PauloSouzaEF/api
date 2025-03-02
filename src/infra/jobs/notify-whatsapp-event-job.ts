import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";
import { agenda } from "../libs/agenda";
import MongooseEventModel, {
	Supplier,
	Event,
} from "../databases/model/mongoose-event-model";
import axios from "axios";
import MongooseUserModel, {
	User,
} from "../databases/model/mongoose-user-model";
import { logError, logInfo } from "../libs/logger";
import { wwebClient } from "../libs/wwebjs";
import { ptBR } from "date-fns/locale";

interface NotifyWhatsAppEventJob {
	eventId: string;
	userId: string;
}

class NotifyWhatsAppEventQueueUtils {
	static formatDateTime(dateTime: Date) {
		return format(dateTime, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
	}

	static calculateSupplierTotal(value: number, quantity: number): number {
		return Number((value * quantity).toFixed(2));
	}

	static formatCurrency(value: number): string {
		return value.toLocaleString("pt-BR", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		});
	}

	static formatSuppliersToWhatsAppPayload(suppliers: Supplier[]) {
		return suppliers
			.map((supplier) => {
				return {
					name: supplier.name,
					value: this.calculateSupplierTotal(supplier.value, supplier.quantity),
					isPaid: supplier.isPaid,
				};
			})
			.reduce((textAccumulator, supplier, index, array) => {
				const isLast = index === array.length - 1;
				return (
					textAccumulator +
					`${supplier.name} - R$ ${this.formatCurrency(supplier.value)} - ${
						supplier.isPaid ? "Pago" : "Não Pago"
					}${isLast ? "" : "\r"}`
				);
			}, "");
	}

	static formatWhatsAppMessage(user: User, event: Event) {
		return `📢 Aviso de Evento

Olá, ${user.name}, tudo bem?

Informamos que o evento *${event.name}* está agendado com os seguintes detalhes:

📅 Data do Evento: ${this.formatDateTime(new TZDate(event.dateTime, "America/Sao_Paulo"))}
🏛 Local: ${event.address}

🛠 Fornecedores e Valores:
${this.formatSuppliersToWhatsAppPayload(event.suppliers)}

📈 Valores:
Total de Gastos: R$ ${this.formatCurrency(event.expense)}
Total de Recebimentos: R$ ${this.formatCurrency(event.income)}`;
	}

	static async sendWhatsAppMessage(number: string, message: string) {
		const numberContactPayload = await wwebClient.getNumberId(number);

		if (!numberContactPayload) {
			logInfo("only contacts can send messages", { number });
			return;
		}

		const wid = numberContactPayload._serialized;
		await wwebClient.sendMessage(wid, message);
	}
}

agenda.define<NotifyWhatsAppEventJob>(
	"notify-whatsapp-event-job",
	async (job) => {
		logInfo("Job started", {
			jobData: job.attrs.data,
		});

		const { eventId, userId } = job.attrs.data;

		const [event, user] = await Promise.all([
			MongooseEventModel.findById(eventId),
			MongooseUserModel.findById(userId),
		]);

		if (!event || !user) {
			return;
		}

		try {
			await NotifyWhatsAppEventQueueUtils.sendWhatsAppMessage(
				user.phoneNumber,
				NotifyWhatsAppEventQueueUtils.formatWhatsAppMessage(user, event),
			);

			const jobExecution = new Date();

			await MongooseEventModel.updateOne(
				{ _id: eventId },
				{
					jobExecution,
				},
			);

			logInfo("Event notified successfully", {
				eventId,
				userId,
				jobExecution,
			});
		} catch (error) {
			if (axios.isAxiosError(error)) {
				logError("Event notified error", {
					data: error?.response?.data,
					headers: error?.response?.headers,
					status: error?.response?.status,
				});

				return;
			}

			logError("Event notified error", {
				eventId,
				userId,
				error,
			});
		}
	},
);
