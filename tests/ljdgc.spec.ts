import {test, expect} from '@playwright/test';
import { Calculation } from '../main/calculation';
const path = require('path');

test.describe('Formulaire Insription', () => {
    test('Inscription en présentiel', async ({ page }) => {
        // First page fields
        const retreat:string = 'Grand Sceau du 05/07/2025 au 11/07/2025';
        const firstName:string = 'Automation';
        const lastName:string = 'Test';
        const gender:string = 'F';
        const birthYear:string = '1974';
        const email:string = 'iten74@yahoo.com';
        const phone:string = '0401010101';
        const phone2:string = '0402020202';
        const streetAdress:string = '387 route des Blancs';
        const address2:string = 'Chantaussel';
        const city:string = 'Saint-Julien-en-Champsaur';
        const zipCode:string = '05500';
        const country:string = 'France';
        // Oui: #label_1_75_0, Non: #label_1_75_1
        const secondPlusRetreat:string = '#label_1_75_0';
        const motivation: string = 'Je veux venir :-)';
        const trouble: string = 'Je ne suis pas sure';
        const pictureFileName:string = '../data/image001.jpg';
        const incomeLevel: string = 'Tranche1';

        // Second page fields
        // Non: #choice_1_10_0, Oui: #choice_1_10_1
        const changementDeDate:string = '#choice_1_10_0';
        const newArrivalDay:string = '01';
        const newArrivalMonth:string = '07';
        const newArrivalYear:string = '2025';
        const newDepartureDay:string = '13';
        const newDepartureMonth:string = '07';
        const newDepartureYear:string = '2025';
        // breakfast: #input_1_60_0, lunch: #input_1_60_1, diner: #input_1_60_2, none:#input_1_60_3
        const premierRepas:string = '#input_1_60_1';

        // breakfast: #input_1_61_0, lunch: #input_1_61_1, diner: #input_1_61_2, none:#input_1_61_3
        const dernierRepas:string = '#input_1_61_2';
        // non: #choice_1_79_0, oui: #choice_1_79_1, unknown: #choice_1_79_2
        const pickup:string = '#choice_1_79_0';
        // oui: #choice_1_83_0, non: #choice_1_83_1
        const sharing:string = '#choice_1_83_0';
        // hermitage: #choice_1_29_0, tent: #choice_1_29_1, outside: #choice_1_29_2
        const lodging:string = '#choice_1_29_0';
        const specialRequest:boolean = false;
        const specialRequestText:string = 'I want a single room';
        // oui: #choice_1_85_0, non: #choice_1_85_1
        const bringBlanket:string = '#choice_1_85_0';
        const skipDinner:boolean = false;
        const needTablet:boolean = true;


        // open url
        await page.goto('https://ljdgc.pemaweb.fr/demande-dinscription-pour-une-retraite/');
        // verify title
        await expect(page).toHaveTitle('Formulaire d’inscription – Le Jardin de Grande Compassion');

    /********************************************************************/
    /************************** Première page ***************************/
    /********************************************************************/

        // verifying we are on step 1
        await expect(page.locator('.gf_progressbar_title')).toHaveText('Étape 1 sur 3');
        
        await page.waitForSelector('#input_1_7');

        const retreatDropdown = await page.locator('#input_1_7');
        retreatDropdown.selectOption({label: retreat});
        // NOTE: no way to verify that the right retreat was selected here. We will do that in step 3.

        // entering first name and name
        await page.locator('#input_1_3').fill(firstName);
        await page.locator('#input_1_5').fill(lastName);
        // selecting gender
        await page.locator(`input[value="${gender}"]`).check();
        // entering the birth year. Doesn't look like we can verify non compulsory fields
        const yearInput = await page.locator('#input_1_73');
        await yearInput.scrollIntoViewIfNeeded();
        await yearInput.fill(birthYear);
        // entering email and verifying
        await page.locator('#input_1_96').fill(email);
        // entering phones
        await page.locator('#input_1_102').fill(phone);
        await page.locator('#input_1_103').fill(phone2);
        // entering address
        const addressInput = page.locator('#input_1_74_1');
        addressInput.scrollIntoViewIfNeeded();
        await addressInput.fill(streetAdress);
        await page.locator('#input_1_74_2').fill(address2);
        await page.locator('#input_1_74_3').fill(city);
        await page.locator('#input_1_74_5').fill(zipCode);
        const countryDropdown = await page.locator('#input_1_74_6');
        countryDropdown.scrollIntoViewIfNeeded();
        countryDropdown.selectOption(country);
        // choosing if other retreats before
        const firstMeal = await page.locator(secondPlusRetreat);
        await firstMeal.scrollIntoViewIfNeeded();
        await firstMeal.check();

        const retreatQuestionValue:string = await firstMeal.inputValue();
        // case of first retreat
        if (retreatQuestionValue !== "Oui") {
            await page.locator('#input_1_76').fill(motivation);
            const troubleInput = await page.locator('#input_1_77');
            await troubleInput.scrollIntoViewIfNeeded();
            await troubleInput.fill(trouble);
        }

        // upload picture
        const filePath = path.join(__dirname, pictureFileName);
        await page.setInputFiles('#input_1_6', filePath);

        // entering income
        const incomeDropdown = await page.locator('#input_1_38');
        await incomeDropdown.scrollIntoViewIfNeeded()
        await incomeDropdown.selectOption(incomeLevel);

        // clicking on Next button
        const nextButtonPage1 = await page.locator('#gform_next_button_1_8');
        nextButtonPage1.scrollIntoViewIfNeeded();
        nextButtonPage1.click();

    /********************************************************************/
    /************************** Deuxième page ***************************/
    /********************************************************************/

        // verifying we are on step 2
        await expect(page.locator('.gf_progressbar_title')).toHaveText('Étape 2 sur 3');

        // waiting for page to load
        await page.waitForSelector(changementDeDate);
        // choosing if other retreats before
        const changementRadio = await page.locator(changementDeDate);
        await changementRadio.scrollIntoViewIfNeeded();
        await changementRadio.check();

        const changementValue:string = await changementRadio.inputValue();
        // case of change of day
        if (changementValue === "Oui") {
            // entering new arrival date
            await page.locator('#input_1_11_2').selectOption(newArrivalDay);
            await page.locator('#input_1_11_1').selectOption(newArrivalMonth);
            await page.locator('#input_1_11_3').selectOption(newArrivalYear);
            await page.locator('#input_1_13_2').selectOption(newDepartureDay);
            await page.locator('#input_1_13_1').selectOption(newDepartureMonth);
            await page.locator('#input_1_13_3').selectOption(newDepartureYear);
            const firstMeal = await page.locator(premierRepas);
            await firstMeal.scrollIntoViewIfNeeded();
            await firstMeal.check();
            const lastMeal = await page.locator(dernierRepas);
            await lastMeal.scrollIntoViewIfNeeded();
            await lastMeal.check();
        }

        // entering pickup option:
        const pickupOption = await page.locator(pickup);
        await pickupOption.scrollIntoViewIfNeeded();
        await pickupOption.check();
        // entering if we want to share our info with other participants
        const sharingOption = await page.locator(sharing);
        await sharingOption.scrollIntoViewIfNeeded();
        await sharingOption.check();
        // entering lodging choice
        const lodgingOption = await page.locator(lodging);
        await lodgingOption.scrollIntoViewIfNeeded();
        await lodgingOption.check();

        if (lodging === '#choice_1_29_0') {
            if (specialRequest) {
                await page.locator('#choice_1_33_1').check();
                await page.locator('#input_1_97').fill(specialRequestText);
            } 
        }
        if (lodging !== '#choice_1_29_2') {
            const blanketRadio = await page.locator(bringBlanket);
            await blanketRadio.scrollIntoViewIfNeeded();
            await blanketRadio.check();
        }
        if (skipDinner) {
            await page.locator('#choice_1_65_1').check();
        }
        if (needTablet) {
            const tabletCheck = await page.locator('#choice_1_90_1');
            await tabletCheck.scrollIntoViewIfNeeded();
            await tabletCheck.check();
        }
        const rulesCheck = await page.locator('#choice_1_93_1');
        await rulesCheck.scrollIntoViewIfNeeded();
        await rulesCheck.check();
        const nextButtonPage2 = await page.locator('#gform_next_button_1_14');
        await nextButtonPage2.scrollIntoViewIfNeeded();
        await nextButtonPage2.click();
        await page.waitForTimeout(15000);

    
        /********************************************************************/
        /************************** Troisième page **************************/
        /********************************************************************/

        const firstMealId: number = Number(premierRepas.slice(-1));
        const lastMealId: number = Number(dernierRepas.slice(-1));
        const lodgingId: number = Number(lodging.slice(-1));
        // No need for await because this calculation depends only on constants passed to the program
        let numberOfNights: number;
        if (changementValue) {
            const newArrival: string = `${newArrivalDay}/${newArrivalMonth}/${newArrivalYear}`;
            const newDeparture: string = `${newDepartureDay}/${newDepartureMonth}/${newDepartureYear}`;
            numberOfNights = Calculation.computeNumberOfNights(retreat, newArrival, newDeparture);
        } else {
            numberOfNights = Calculation.computeNumberOfNights(retreat);
        }
        // verifying we are on step 3 and making sure calculations don't happen until the number of nights is calculated
        await expect(page.locator('.gf_progressbar_title')).toHaveText('Étape 3 sur 3').then(() => {
            // verifying meal cost
            const calculatedMealCost: number = Calculation.getMealCost(firstMealId, lastMealId, incomeLevel, skipDinner, numberOfNights);
            expect(page.locator('#input_1_54')).toHaveText(`${calculatedMealCost.toFixed(2)} €`);

            // verifying lodging cost
            const calculatedLodgingCost:number = Calculation.getLodgingCost(lodgingId, incomeLevel, numberOfNights, specialRequest);
            expect(page.locator('#input_1_55')).toHaveText(`${calculatedLodgingCost.toFixed(2)} €`);

            // verifying fees (frais de gestion)
            const calculatedFees: number = Calculation.getTotalFees(incomeLevel, numberOfNights);
            expect(page.locator('#input_1_56')).toHaveText(`${calculatedFees.toFixed(2)} €`);

            // verifying taxes (de séjour)
            const calculatedTaxes: number = Calculation.getTaxes(numberOfNights);
            expect(page.locator('#input_1_26')).toHaveText(`${calculatedTaxes.toFixed(2)} €`);

            // verifying total cost
            const calculatedTotalCost: number = Calculation.getTotalCostOfStay(calculatedMealCost, calculatedLodgingCost, calculatedFees, calculatedTaxes);
            expect(page.locator('#input_1_24')).toHaveText(`${calculatedTotalCost.toFixed(2)} €`);
        });
    })  
})
