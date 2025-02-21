import { HttpStatusCode } from "@/core/infra/enums/http-status-code";
import EventModel from "@/infra/databases/model/mongoose-event-model";
import { format } from "date-fns";
import { Request, Response } from "express";

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

		const eventsQuantityPerYear = events.reduce(
			(acc, event) => {
				const year = event.dateTime.getFullYear();

				if (!acc[year]) {
					acc[year] = 0;
				}

				acc[year]++;

				return acc;
			},
			{} as Record<number, number>,
		);

		return eventsQuantityPerYear;
	}

	private static formatToFixed(number: number) {
		return Number(number.toFixed(2));
	}
}
