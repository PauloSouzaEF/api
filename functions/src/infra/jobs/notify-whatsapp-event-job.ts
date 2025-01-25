import { format } from "date-fns";
import { agenda } from "../libs/agenda";
import {
	MongooseEventModel,
	Supplier,
} from "../databases/model/mongoose-event-model";
import axios from "axios";
import { env } from "@/env";
import { logError } from "../libs/pino";
import { MongooseUserModel } from "../databases/model/mongoose-user-model";

type WhatsAppTemplate = "event_notification_01";

interface NotifyWhatsAppEventJob {
	eventId: string;
	userId: string;
}

interface SendWhatsAppMessageProps {
	to: string;
	template: WhatsAppTemplate;
	payload: Array<{
		type: string;
		text: string;
	}>;
}

class NotifyWhatsAppEventQueueUtils {
	static formatDateTime(dateTime: Date) {
		return format(dateTime, "dd/MM/yyyy 'às' HH:mm");
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
				};
			})
			.reduce((textAccumulator, supplier, index, array) => {
				const isLast = index === array.length - 1;
				return (
					textAccumulator +
					`${supplier.name} - R$ ${this.formatCurrency(supplier.value)}${
						isLast ? "" : "\r"
					}`
				);
			}, "");
	}

	static async sendWhatsAppMessage({
		to,
		template,
		payload: parameters,
	}: SendWhatsAppMessageProps) {
		try {
			await axios.post(
				`https://graph.facebook.com/v21.0/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
				{
					messaging_product: "whatsapp",
					to,
					type: "template",
					template: {
						name: template,
						language: {
							policy: "deterministic",
							code: "pt_BR",
						},
						components: [
							{
								type: "body",
								parameters,
							},
						],
					},
				},
				{
					headers: {
						Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
					},
				},
			);
		} catch (err) {
			if (axios.isAxiosError(err)) {
				logError({
					responseData: err.response?.data,
					responseHeaders: err.response?.headers,
				});

				return;
			}

			logError({ err });
		}
	}
}

agenda.define<NotifyWhatsAppEventJob>(
	"notify-whatsapp-event-job",
	async (job) => {
		const { eventId, userId } = job.attrs.data;

		const [event, user] = await Promise.all([
			MongooseEventModel.findById(eventId),
			MongooseUserModel.findById(userId),
		]);

		if (!event || !user) {
			return;
		}

		const suppliers =
			NotifyWhatsAppEventQueueUtils.formatSuppliersToWhatsAppPayload(
				event.suppliers,
			);

		const whatsAppPayload = [
			{
				type: "text",
				text: user.name,
			},
			{
				type: "text",
				text: event.name,
			},
			{
				type: "text",
				text: NotifyWhatsAppEventQueueUtils.formatDateTime(event.dateTime),
			},
			{
				type: "text",
				text: event.address,
			},
			{
				type: "text",
				text: suppliers,
			},
		];

		await NotifyWhatsAppEventQueueUtils.sendWhatsAppMessage({
			to: user.phoneNumber,
			template: "event_notification_01",
			payload: whatsAppPayload,
		});

		await MongooseEventModel.updateOne(
			{ _id: eventId },
			{
				jobExecution: new Date(),
			},
		);
	},
);
