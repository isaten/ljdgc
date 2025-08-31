import * as TarifList from '../data/tarif.json';

export class Calculation {

    private static readonly taxeDeSéjour: number = 0.66;

    /**
     * Calculate the number of nights the participant will be at the center
     * @param retreatLongName: example: 05/07/2025 au 11/07/2025 - Grand Sceau
     * @param differentArrival: participant's actual arrival date
     * @param differentDeparture: participant's actual departure date
     * @return: returns the number of day at the center (DOES NOT include day of arrival NOR day of departure)
     */
    public static computeNumberOfNights(retreatLongName: string, differentArrival?: string, differentDeparture?: string): number {
        let retreatBeginning: string = retreatLongName.substring(retreatLongName.indexOf('/')-2,retreatLongName.indexOf('/')+8);
        let retreatEnd: string = retreatLongName.substring(retreatLongName.lastIndexOf('/')-5, retreatLongName.lastIndexOf('/')+5);
        console.log(`retreatBeginning: ${retreatBeginning} and retreatEnd: ${retreatEnd}`);
        let firstDay: string = (differentArrival !== undefined) ? differentArrival : retreatBeginning;
        let lastDay: string = (differentDeparture !== undefined) ? differentDeparture : retreatEnd;
        let firstDateArray: string[] = firstDay.split('/');
        let lastDateArray: string[] = lastDay.split('/');
        const date1 = new Date(Number(firstDateArray[2]),Number(firstDateArray[1])-1,Number(firstDateArray[0]));
        const date2 = new Date(Number(lastDateArray[2]),Number(lastDateArray[1])-1,Number(lastDateArray[0]));
        const numberOfNights = this.calculateNightsBetweenDates(date1, date2);
        console.log(`Number of nights between ${date1.toDateString()} and ${date2.toDateString()}: ${numberOfNights}`);
        return numberOfNights;
    }

    private static calculateNightsBetweenDates(startDate: Date, endDate: Date): number {
        const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
      
        const timeDifference = end.getTime() - start.getTime();
        const numberOfNights = Math.round(timeDifference / (1000 * 60 * 60 * 24));
      
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
    public static getMealCost(firstMeal: number, lastMeal: number, tarifLevel: string, skipDinner: string, numberOfNights: number): number {
        // Remove first day since it's a partial day
        const numberOfFullDays = numberOfNights - 1;
        const tarifForLevel = TarifList[tarifLevel];
        const costPerDay: number = (skipDinner === 'true') ? (tarifForLevel["breakfast"] + tarifForLevel["lunch"]) : tarifForLevel["total"];
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
    public static getLodgingCost(lodging: number, tarifLevel: string, numberOfNights: number): number {
        const tarifForLevel = TarifList[tarifLevel];
        // Case of staying outside of the hermitage - Case lodging === 2
        let costPerNight:number = 0;
        if (lodging === 0) {
            costPerNight = tarifForLevel["lodging"];
            if (numberOfNights >= 15) {
                costPerNight -= 2;
            }
        } else if (lodging === 1) {
            costPerNight = tarifForLevel["camping"];
        }   
        const totalLodgingCost: number = costPerNight * numberOfNights;
        console.log(`Total lodging cost for lodging: cost per night: ${costPerNight} and number of nights: ${numberOfNights}: ${totalLodgingCost}`);
        return totalLodgingCost;
    }

    public static getSpecialRequestCost(tarifLevel: string, numberOfNights: number) {
        const tarifForLevel = TarifList[tarifLevel];
        let costPerNight:number = tarifForLevel["privateRoom"];
        const specialRequestCost: number = costPerNight * numberOfNights;
        return specialRequestCost;
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
        return totalFees;
    }

    public static getTaxes(lodging: number, numberOfNights: number): number {
        let tax: number = 0;
        if (lodging !== 2) {
            tax = this.taxeDeSéjour * numberOfNights;
        }
        return tax
    }

    /**
     * Calculates the total cost of the stay including taxes
     * @param mealCost 
     * @param lodgingCost 
     * @param fees 
     */
    public static getTotalCostOfStay(mealCost: number, lodgingCost: number, specialRequestCost: number, fees: number, taxes: number): number {
        console.log(`\n\nCalculating total cost by adding:\nMeal cost: ${mealCost}\nLodging cost: ${lodgingCost}\nSpecial Request cost: ${specialRequestCost}\nFees: ${fees}\nTaxes:${taxes}`);
        const totalCost: number = mealCost + lodgingCost + specialRequestCost + fees + taxes;
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
    private static computeAdjustment(firstMeal: number, lastMeal: number, tarifLevel: string, skipDinner: string): number {
        let adjustment:number = 0;
        let adjustmentFirstDay: number = 0;
        let adjustmentLastDay: number = 0;
        // let codeAdjustment:number = firstMeal + lastMeal;
        const tarifForLevel = TarifList[tarifLevel];
        const firstDayTotal: number = 0;
        switch (firstMeal) {
            case 0:
                adjustmentFirstDay = tarifForLevel["breakfast"] + tarifForLevel["lunch"];
                if (skipDinner === 'false') {
                    adjustmentFirstDay += tarifForLevel["dinner"];
                }
                break;
            case 1:
                adjustmentFirstDay = tarifForLevel["lunch"];
                if (skipDinner === 'false') {
                    adjustmentFirstDay += tarifForLevel["dinner"];
                }
                break;
            case 2:
                if (skipDinner === 'false') {
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
                if (skipDinner === 'false') {
                    adjustmentLastDay += tarifForLevel["dinner"];
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
}


