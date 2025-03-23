import * as TarifList from '../data/tarif.json';

export class Calculation {

    private static readonly taxeDeSéjour: number = 0.66;

    /**
     * Calculate the number of nights the participant will be at the center
     * @param retreatLongName: example: Grand Sceau du 05/07/2025 au 11/07/2025
     * @param differentArrival: participant's actual arrival date
     * @param differentDeparture: participant's actual departure date
     * @return: returns the number of day at the center (DOES NOT include day of arrival NOR day of departure)
     */
    public static computeNumberOfNights(retreatLongName: string, differentArrival?: string, differentDeparture?: string): number {
        let retreatBeginning: string = retreatLongName.substring(retreatLongName.indexOf('/')-2,retreatLongName.indexOf('/')+7);
        let retreatEnd: string = retreatLongName.substring(retreatLongName.lastIndexOf('/')-5, retreatLongName.lastIndexOf('/')+4);
        console.log(`retreatBeginning: ${retreatBeginning} and retreatEnd: ${retreatEnd}`);
        let firstDay: string = (differentArrival !== undefined) ? differentArrival : retreatBeginning;
        let lastDay: string = (differentDeparture !== undefined) ? differentDeparture : retreatEnd;
        const timeDiff = Math.abs(this.getDateObjectFromDateString(lastDay).getTime() - this.getDateObjectFromDateString(firstDay).getTime());
        const numberOfNights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        console.log(`Number of days between ${firstDay} and ${lastDay}: ${numberOfNights}`);
        return numberOfNights;
    }

    /**
     * Calculate the cost for all full days then add the cost for the first and last day.
     * Takes into account whether skip dinner was selected 
     * 0: breakfast, 1: lunch, 2: dinner, 3: none
     * @param firstMeal: number 0-3 corresponding to last number of id of selector (see above)
     * @param lastMeal: number 0-3 corresponding to last number of id of selector (see above)
     * @param tarifLevel: tranche number: Tranche1, Tranche2 ... 
     * @param skipDinner: whether participants want to skip dinner
     * @param numberOfNights
     * @return Returns the calculatedCost for all the meals
     */
    public static getMealCost(firstMeal: number, lastMeal: number, tarifLevel: string, skipDinner: boolean, numberOfNights: number): number {
        // Remove first day since it's a partial day
        const numberOfFullDays = numberOfNights - 1;
        const tarifForLevel = TarifList[tarifLevel];
        const costPerDay: number = (skipDinner) ? (tarifForLevel["breakfast"] + tarifForLevel["lunch"]) : tarifForLevel["total"];
        const costForFullDays: number =  costPerDay * numberOfFullDays;
        const costForPartialDays: number = this.computeAdjustment(firstMeal, lastMeal, tarifLevel, skipDinner);
        console.log(`Cost for full days: ${costForFullDays}`);
        return costForFullDays + costForPartialDays;
    }

    /**
     * Calulates the lodging costs. Takes into account adding the special request amount
     * 0: hermitage, 1: camping, 2: outside
     * @param lodging number 0-2 corresponding to last number of id of selector (see above)
     * @param tarifLevel tranche number: Tranche1, Tranche2 ... 
     * @param numberOfNights 
     * @param specialRequest boolean, if yes, there is an added cost
     */
    public static getLodgingCost(lodging: number, tarifLevel: string, numberOfNights: number, specialRequest: boolean): number {
        const tarifForLevel = TarifList[tarifLevel];
        // Case of staying outside of the hermitage - Case lodging === 2
        let costPerNight:number = 0;
        if (lodging === 0) {
                costPerNight = tarifForLevel["lodging"];
                costPerNight += (specialRequest) ? tarifForLevel["privateRoom"] : 0;
        } else if (lodging === 1) {
                costPerNight = tarifForLevel["camping"];
        }   
        const totalLodgingCost: number = costPerNight * numberOfNights;
        console.log(`Total lodging cost for lodging: ${lodging} and number of nights: ${numberOfNights} with special request: ${specialRequest}`);
        return totalLodgingCost;
    }

    /**
     * Calculates the total management fees for the amount of night stayed
     * @param tarifLevel 
     * @param numberOfNights 
     * @return total management fees for the entire stay
     */
    public static getTotalFees(tarifLevel: string, numberOfNights: number): number {
        const tarifForLevel = TarifList[tarifLevel];
        const totalFees: number = tarifForLevel["fees"] * numberOfNights;
        console.log(`Management fees for ${numberOfNights} nights: ${totalFees}`);
        return totalFees;
    }

    public static getTaxes(numberOfNights: number): number {
        return this.taxeDeSéjour * numberOfNights;
    }

    /**
     * Calculates the total cost of the stay including taxes
     * @param mealCost 
     * @param lodgingCost 
     * @param fees 
     */
    public static getTotalCostOfStay(mealCost: number, lodgingCost: number, fees: number, taxes: number): number {
        const totalCost: number = mealCost + lodgingCost + fees + taxes;
        console.log(`Total cost: ${totalCost}`);
        return totalCost;
    }

    /**
     * Compute the adjustment amount based on first and last meal if different than default
     * Take into account whether skip dinner was selected 
     * 0: breakfast, 1: lunch, 2: dinner, 3: none
     * @param firstMeal: number 0-3 corresponding to last number of id of selector
     * @param lastMeal: number 0-3 corresponding to last number of id of selector
     * @param tarifLevel: tranche number: Tranche1, Tracnhe2 ... 
     * @param skipDinner: whether participants want to skip dinner
     * @returns adjustment amount
     */
    private static computeAdjustment(firstMeal: number, lastMeal: number, tarifLevel: string, skipDinner: boolean): number {
        let adjustment:number = 0;
        let adjustmentFirstDay: number = 0;
        let adjustmentLastDay: number = 0;
        // let codeAdjustment:number = firstMeal + lastMeal;
        const tarifForLevel = TarifList[tarifLevel];
        const firstDayTotal: number = 0;
        switch (firstMeal) {
            case 0:
                adjustmentFirstDay = tarifForLevel["breakfast"] + tarifForLevel["lunch"];
                if (!skipDinner) {
                    adjustmentFirstDay += tarifForLevel["dinner"];
                }
                break;
            case 1:
                adjustmentFirstDay = tarifForLevel["lunch"];
                if (!skipDinner) {
                    adjustmentFirstDay += tarifForLevel["dinner"];
                }
                break;
            case 2:
                if (!skipDinner) {
                    adjustmentFirstDay = tarifForLevel["dinner"];
                }
                break;
            default:
                adjustmentFirstDay = 0;
                break;
        }
        switch (lastMeal) {
            case 0:
                adjustmentLastDay = tarifForLevel["breakfast"];
                break;
            case 1:
                adjustmentLastDay = tarifForLevel["breakfast"] + tarifForLevel["lunch"];
                break;
            case 2: 
                adjustmentLastDay = tarifForLevel["breakfast"] + tarifForLevel["lunch"];
                if (!skipDinner) {
                    adjustmentFirstDay += tarifForLevel["dinner"];
                }
                break;
            default:
                adjustmentLastDay = 0;
                break;
        }
        console.log(`Adjustment day 1: ${adjustmentFirstDay} and adjustment last day: ${adjustmentLastDay}`);
        adjustment = adjustmentFirstDay + adjustmentLastDay;
        console.log(`Adjustment total: ${adjustment}`);
        return adjustment;
    }

    /**
     * Returns a date object from a French formatted date string with forward slashes
     * @param dateString: dd/mm/yyyy 
     */
    private static getDateObjectFromDateString(dateString: string): Date {
        let dateArray: string[] = dateString.split('/');
        return new Date(parseInt(dateArray[2]),parseInt(dateArray[1]),parseInt(dateArray[0]));
    }
}


