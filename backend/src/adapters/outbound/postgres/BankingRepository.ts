import type { IBankingRepository } from "../../../core/ports/IBankingRepository.js";
import type { BankRequest, ApplyRequest, ApplyResponse } from "../../../core/domain/index.js";
import prisma from "../../../infrastructure/db/prisma.js";
import { AppError } from "../../../shared/errors/AppError.js";

export class BankingRepository implements IBankingRepository {
    
    //  Bank surplus credits for a ship
    async bankSurplus(request: BankRequest): Promise<{ shipId: string; year: number; amount: number }> {
        try {
            // Verify the ship exists (by checking if route_id exists)
            const shipExists = await prisma.route.findUnique({
                where: { route_id: request.shipId }
            });

            if (!shipExists) {
                throw new AppError(`Ship with ID ${request.shipId} not found`, 404);
            }

            // Validate amount is positive
            if (request.amount <= 0) {
                throw new AppError("Bank amount must be positive", 400);
            }

            // Create bank entry
            const bankEntry = await prisma.bankEntry.create({
                data: {
                    ship_id: request.shipId,
                    year: request.year,
                    amount_gco2eq: request.amount,
                },
            });

            return {
                shipId: bankEntry.ship_id,
                year: bankEntry.year,
                amount: bankEntry.amount_gco2eq,
            };
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(
                `Failed to bank surplus: ${error instanceof Error ? error.message : 'Unknown error'}`,
                500
            );
        }
    }

    // Get total banked amount for a ship
    async getTotalBanked(shipId: string): Promise<number> {
        try {
            const result = await prisma.bankEntry.aggregate({
                where: { ship_id: shipId },
                _sum: {
                    amount_gco2eq: true,
                },
            });

            return result._sum.amount_gco2eq || 0;
        } catch (error) {
            throw new AppError(
                `Failed to get total banked: ${error instanceof Error ? error.message : 'Unknown error'}`,
                500
            );
        }
    }

    // Apply banked credits to cover deficit

    async applyBanked(request: ApplyRequest): Promise<ApplyResponse> {
        try {
            const cb_before = await this.getTotalBanked(request.shipId);

            // Validate sufficient balance
            if (request.applyAmount > cb_before) {
                throw new AppError(
                    `Insufficient banked balance. Available: ${cb_before}, Requested: ${request.applyAmount}`,
                    400
                );
            }

            if (request.applyAmount <= 0) {
                throw new AppError("Apply amount must be positive", 400);
            }

            // Create a negative entry to represent withdrawal
            await prisma.bankEntry.create({
                data: {
                    ship_id: request.shipId,
                    year: request.year,
                    amount_gco2eq: -request.applyAmount, // Negative to subtract from total
                },
            });

            const cb_after = cb_before - request.applyAmount;

            return {
                cb_before,
                applied: request.applyAmount,
                cb_after,
            };
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(
                `Failed to apply banked credits: ${error instanceof Error ? error.message : 'Unknown error'}`,
                500
            );
        }
    }
}
