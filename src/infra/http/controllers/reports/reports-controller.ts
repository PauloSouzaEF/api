import { HttpStatusCode } from "@/core/infra/enums/http-status-code";
import EventModel from "@/infra/databases/model/mongoose-event-model";
import { getMonthsNames } from "@/utils/get-months-names";
import { format } from "date-fns";
import { Request, Response } from "express";

interface EventQuantityMonthlyDivided {
	[year: number]: {
		month: string;
		quantity: number;
	}[];
}

export class ReportsController {
	public static async handle(_request: Request, response: Response) {
		const lastFiveEvents = await this.getLastFiveEvents();
		const distributedValues = await this.getIncomeAndExpense();
		const eventsQuantityPerYear = await this.getEventsQuantityPerYear();

		return response.status(HttpStatusCode.Ok).json({
			lastFiveEvents,
			distributedValues,
			eventsQuantityPerYear,
		});
	}

	private static async getLastFiveEvents() {
		const events = await EventModel.find().sort({ dateTime: -1 }).limit(5);

		return events.map((event) => ({
			name: event.name,
			date: format(event.dateTime, "dd/MM/yyyy"),
		}));
	}

	private static async getIncomeAndExpense() {
		const events = await EventModel.find();

		const grossIncome = events.reduce((acc, event) => acc + event.income, 0);
		const grossExpense = events.reduce((acc, event) => acc + event.expense, 0);

		const profit = this.formatToFixed(grossIncome - grossExpense);
		const income = this.formatToFixed(grossIncome);
		const expense = this.formatToFixed(grossExpense);

		return { income, expense, profit };
	}

	private static async getEventsQuantityPerYear() {
		const events = await EventModel.find();

		const eventsPerYear = new Set(
			events.map((event) => event.dateTime.getFullYear()),
		);

		const eventsMonthlyDivided = this.loadEventsPerMonth(
			Array.from(eventsPerYear),
		);

		const eventsQuantityPerYear = events.reduce((acc, event) => {
			const year = event.dateTime.getFullYear();
			const month = event.dateTime.getMonth();

			const yearExists = acc[year];
			const monthExists = yearExists[month];

			monthExists.quantity += 1;

			return acc;
		}, eventsMonthlyDivided);

		return eventsQuantityPerYear;
	}

	private static loadEventsPerMonth(years: number[]) {
		const eventsMonthlyDivided = {} as EventQuantityMonthlyDivided;

		const monthsNames = getMonthsNames();

		for (const year of years) {
			for (const month of monthsNames) {
				if (!eventsMonthlyDivided[year]) {
					eventsMonthlyDivided[year] = [];
				}

				eventsMonthlyDivided[year].push({
					month,
					quantity: 0,
				});
			}
		}

		return eventsMonthlyDivided;
	}

	private static formatToFixed(number: number) {
		return Number(number.toFixed(2));
	}
}
