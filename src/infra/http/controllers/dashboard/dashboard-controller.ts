import { HttpStatusCode } from "@/core/infra/enums/http-status-code";
import MongooseEventModel from "@/infra/databases/model/mongoose-event-model";
import { endOfMonth, endOfYear, startOfMonth, startOfYear } from "date-fns";
import type { Request, Response } from "express";

interface EventMonthlyDivided {
	[key: string]: {
		income: number;
		expense: number;
	};
}

export class DashboardController {
	private static readonly monthNames = [
		"Jan",
		"Fev",
		"Mar",
		"Abr",
		"Mai",
		"Jun",
		"Jul",
		"Ago",
		"Set",
		"Out",
		"Nov",
		"Dez",
	];

	public static async handle(_request: Request, response: Response) {
		const now = new Date();

		const monthlyEvents = await MongooseEventModel.find({
			dateTime: {
				$gte: startOfMonth(now),
				$lte: endOfMonth(now),
			},
		}).exec();

		const annualEvents = await MongooseEventModel.find({
			dateTime: {
				$gte: startOfYear(now),
				$lte: endOfYear(now),
			},
		}).exec();

		const eventsMonthlyDivided = annualEvents.reduce((acc, event) => {
			const month = this.getMonthName(event.dateTime);

			if (!acc[month]) {
				acc[month] = { income: 0, expense: 0 };
			}

			acc[month].income += event.income;
			acc[month].expense += event.expense;

			return acc;
		}, {} as EventMonthlyDivided);

		for (const month of this.monthNames) {
			if (!eventsMonthlyDivided[month]) {
				eventsMonthlyDivided[month] = { income: 0, expense: 0 };

				continue;
			}

			eventsMonthlyDivided[month].income = Number(
				eventsMonthlyDivided[month].income.toFixed(2),
			);

			eventsMonthlyDivided[month].expense = Number(
				eventsMonthlyDivided[month].expense.toFixed(2),
			);
		}

		const incomePerMonth = monthlyEvents.reduce((acc, event) => {
			return Number((acc + event.income).toFixed(2));
		}, 0);

		const expensePerMonth = monthlyEvents.reduce((acc, event) => {
			return Number((acc + event.expense).toFixed(2));
		}, 0);

		const profitPerMonth = Number(
			(incomePerMonth - expensePerMonth).toFixed(2),
		);
		const totalPerMonth = monthlyEvents.length;

		return response.status(HttpStatusCode.Ok).send({
			monthlyEvents: eventsMonthlyDivided,
			incomePerMonth,
			expensePerMonth,
			totalPerMonth,
			profitPerMonth,
		});
	}

	private static getMonthName(date: Date) {
		const month = date.toLocaleString("pt-BR", { month: "short" });
		return this.capitalizeFirstLetter(month.replace(".", ""));
	}

	private static capitalizeFirstLetter(input: string): string {
		if (!input) return input;
		return input.charAt(0).toUpperCase() + input.slice(1);
	}
}
