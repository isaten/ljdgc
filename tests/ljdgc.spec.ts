import { test, expect } from '@playwright/test';
import { Calculation } from '../main/calculation';
import { TestData } from '../main/testData';
import { CsvParser } from '../main/csvParser'
const path = require('path');

test.describe('Formulaire Insription', () => {
    test('Inscription en présentiel', async ({ page }) => {

        try {
            // Reading CSV file and storing in array of Objects of type TestData
            const filePath = './data/dataPresentiel.csv';
            const rows:TestData[] = await CsvParser.readCsv(filePath);
            await console.log(`Number of rows: ${rows.length-1}`);

            const headersArray:string[] = rows[0].toString().split(",");
            for ( let i=1; i<rows.length; i++ ) {
                await console.log(`######## Row ${i} ########`);
                const data: TestData = await CsvParser.csvToJson(rows[i].toString(), headersArray) as TestData;
                await console.log(`Retreat: ${data.retreat}`);
                const firstName:string = 'Automation';
                const lastName:string = `Test-${i}`; 

                // open url        
                await page.goto('https://test.thouktchenling.net/inscription/');
                // verify title
                await expect(page).toHaveTitle('Inscription - Le Jardin de Grande Compassion');

            /********************************************************************/
            /************************** Première page ***************************/
            /********************************************************************/

                // verifying we are on step 1
                await expect(page.locator('.gf_progressbar_title')).toHaveText('Étape 1 sur 4');
                
                await page.waitForSelector('#input_1_7');

                const retreatDropdown = await page.locator('#input_1_7');
                retreatDropdown.selectOption({label: data.retreat});

                // entering first name and name
                await page.locator('#input_1_3').fill(firstName);
                await page.locator('#input_1_5').fill(lastName);
                // selecting gender
                await page.locator(`input[value="F"]`).check();
                // entering the birth year. Doesn't look like we can verify non compulsory fields
                const yearInput = await page.locator('#input_1_73');
                await yearInput.scrollIntoViewIfNeeded();
                await yearInput.fill(data.birthYear);

                // entering email and verifying
                await page.locator('#input_1_96').fill(data.email);
                // entering phones
                await page.locator('#input_1_102').fill(data.phone);
                await page.locator('#input_1_103').fill(data.phone2);
                // entering address
                const addressInput = page.locator('#input_1_74_1');
                await addressInput.scrollIntoViewIfNeeded();
                await addressInput.fill(data.streetAdress);
                await page.locator('#input_1_74_2').fill(data.address2);
                await page.locator('#input_1_74_3').fill(data.city);
                await page.locator('#input_1_74_5').fill(data.zipCode);
                const countryDropdown = await page.locator('#input_1_74_6');
                countryDropdown.scrollIntoViewIfNeeded();
                countryDropdown.selectOption(data.country);
                // choosing if other retreats before
                const firstMeal = await page.locator(`#label_1_75_${data.moreThanOneRetreat}`);
                await firstMeal.scrollIntoViewIfNeeded();
                await firstMeal.check();

                // case of first retreat
                if (data.moreThanOneRetreat === '1') {
                    await page.locator('#input_1_76').fill(data.motivation);
                    const troubleInput = await page.locator('#input_1_77');
                    await troubleInput.scrollIntoViewIfNeeded();
                    await troubleInput.fill(data.trouble);
                }

                // upload picture
                const filePath = path.join(__dirname, data.pictureFileName);
                await page.setInputFiles('#input_1_6', filePath);

                // entering income
                const incomeDropdown = await page.locator('#input_1_38');
                await incomeDropdown.scrollIntoViewIfNeeded()
                await incomeDropdown.selectOption(data.incomeLevel);

                // clicking on Next button
                const nextButtonPage1 = await page.locator('#gform_next_button_1_8');
                await nextButtonPage1.scrollIntoViewIfNeeded();
                await nextButtonPage1.click();

            /********************************************************************/
            /************************** Deuxième page ***************************/
            /********************************************************************/

                // verifying we are on step 2
                await expect(page.locator('.gf_progressbar_title')).toHaveText('Étape 2 sur 4');

                // waiting for page to load
                await page.waitForSelector(`#choice_1_10_${data.changementDeDate}`);
                // choosing if other retreats before
                const changementRadio = await page.locator(`#choice_1_10_${data.changementDeDate}`);
                await changementRadio.scrollIntoViewIfNeeded();
                await changementRadio.check();

                // case of change of day
                if (data.changementDeDate === '1') {
                    // entering new arrival date
                    await page.locator('#input_1_11_2').selectOption(data.newArrivalDay);
                    await page.locator('#input_1_11_1').selectOption(data.newArrivalMonth);
                    await page.locator('#input_1_11_3').selectOption(data.newArrivalYear);
                    await page.locator('#input_1_13_2').selectOption(data.newDepartureDay);
                    await page.locator('#input_1_13_1').selectOption(data.newDepartureMonth);
                    await page.locator('#input_1_13_3').selectOption(data.newDepartureYear);
                    const firstMeal = await page.locator(`#choice_1_60_${data.premierRepas}`);
                    await firstMeal.scrollIntoViewIfNeeded();
                    await firstMeal.check();
                    const lastMeal = await page.locator(`#choice_1_61_${data.dernierRepas}`);
                    await lastMeal.scrollIntoViewIfNeeded();
                    await lastMeal.check();
                }

                // entering pickup option:
                const pickupOption = await page.locator(`#choice_1_79_${data.pickup}`);
                await pickupOption.scrollIntoViewIfNeeded();
                await pickupOption.check();
                // entering if we want to share our info with other participants
                const sharingOption = await page.locator(`#choice_1_83_${data.sharing}`);
                await sharingOption.scrollIntoViewIfNeeded();
                await sharingOption.check();
                // entering lodging choice
                const lodgingOption = await page.locator(`#choice_1_29_${data.lodging}`);
                await lodgingOption.scrollIntoViewIfNeeded();
                await lodgingOption.check();

                console.log(`Private room: ${data.privateRoom}`);
                if (data.lodging === '0') {
                    // entering chambre partagée ou individuelle
                    const privateRoom = await page.locator(`#choice_1_114_${data.privateRoom}`);
                    await privateRoom.scrollIntoViewIfNeeded();
                    await privateRoom.check();
                    if (data.privateRoom === '1') {
                        // TODO: uncomment when this is fixed
                        // const privateRoomReasonText = await page.locator('#input_1_97');
                        // await privateRoomReasonText.scrollIntoViewIfNeeded();
                        // await privateRoomReasonText.fill(data.specialRequestText);
                    } 
                }

                if (data.lodging !== '2') {
                    const blanketRadio = await page.locator(`#choice_1_85_${data.bringBlanket}`);
                    await blanketRadio.scrollIntoViewIfNeeded();
                    await blanketRadio.check();
                }
                if (data.skipDinner === 'true') {
                    const skipDinnerCheckbox = await page.locator('#choice_1_65_1');
                    await skipDinnerCheckbox.scrollIntoViewIfNeeded();
                    await skipDinnerCheckbox.check();
                }
                if (data.needTablet === 'true') {
                    const tabletCheck = await page.locator('#choice_1_90_1');
                    await tabletCheck.scrollIntoViewIfNeeded();
                    await tabletCheck.check();
                }

                const nextButtonPage2 = await page.locator('#gform_next_button_1_104');
                await nextButtonPage2.scrollIntoViewIfNeeded();
                await nextButtonPage2.click();

            
                /********************************************************************/
                /************************** Troisième page **************************/
                /********************************************************************/

                // verifying we are on step 3
                await expect(page.locator('.gf_progressbar_title')).toHaveText('Étape 3 sur 4');
                const rulesCheck = await page.locator('#choice_1_93_1');
                await rulesCheck.scrollIntoViewIfNeeded();
                await rulesCheck.check();

                const nextButtonPage3 = await page.locator('#gform_next_button_1_14');
                await nextButtonPage3.scrollIntoViewIfNeeded();
                await nextButtonPage3.click();


                /********************************************************************/
                /************************** Quatrième page **************************/
                /********************************************************************/

                const lodgingId: number = Number(data.lodging);
                // No need for await because this calculation depends only on constants passed to the program
                let numberOfNights: number;
                // by default, first meal is dinner and last meal is lunch.
                let firstMealId: number = 2;
                let lastMealId: number = 1;
                if (data.changementDeDate === '1') {
                    firstMealId = Number(data.premierRepas);
                    lastMealId = Number(data.dernierRepas);
                    const newArrival: string = `${data.newArrivalDay}/${data.newArrivalMonth}/${data.newArrivalYear}`;
                    const newDeparture: string = `${data.newDepartureDay}/${data.newDepartureMonth}/${data.newDepartureYear}`;
                    numberOfNights = Calculation.computeNumberOfNights(data.retreat, newArrival, newDeparture);
                } else {
                    numberOfNights = Calculation.computeNumberOfNights(data.retreat);
                }
                let calculatedMealCost, calculatedLodgingCost, calculatedFees, calculatedTaxes, specialRequestCost: number;
                // verifying we are on step 3 and making sure calculations don't happen until the number of nights is calculated
                await expect(page.locator('.gf_progressbar_title')).toHaveText('Étape 4 sur 4').then(() => {
                    // verifying meal cost
                    calculatedMealCost = Calculation.getMealCost(firstMealId, lastMealId, data.incomeLevel, data.skipDinner, numberOfNights);
                    expect.soft(page.locator('#input_1_54')).toHaveText(`${calculatedMealCost.toFixed(2).replace(/\./,',')} €`);

                    // verifying lodging cost
                    calculatedLodgingCost = Calculation.getLodgingCost(lodgingId, data.incomeLevel, numberOfNights);
                    specialRequestCost = 0
                    if (data.privateRoom === '1') {
                        specialRequestCost = Calculation.getSpecialRequestCost(data.incomeLevel, numberOfNights);
                        expect.soft(page.locator('#input_1_32')).toHaveText(`${specialRequestCost.toFixed(2).replace(/\./,',')} €`);
                    } else {
                        expect.soft(page.locator('#input_1_32')).not.toBeVisible();
                    }
                    if (calculatedLodgingCost > 0) {
                        expect.soft(page.locator('#input_1_55')).toHaveText(`${calculatedLodgingCost.toFixed(2).replace(/\./,',')} €`);
                    } else {
                        expect.soft(page.locator('#input_1_55')).not.toBeVisible();
                    }

                    // verifying fees (frais de gestion)
                    calculatedFees = Calculation.getTotalFees(data.incomeLevel, numberOfNights);
                    expect.soft(page.locator('#input_1_56')).toHaveText(`${calculatedFees.toFixed(2).replace(/\./,',')} €`);

                    // verifying taxes (de séjour)
                    calculatedTaxes = Calculation.getTaxes(lodgingId, numberOfNights);
                    if (calculatedTaxes > 0) {
                        expect.soft(page.locator('#input_1_26')).toHaveText(`${calculatedTaxes.toFixed(2).replace(/\./,',')} €`);
                    } else {
                        expect.soft(page.locator('#input_1_26')).not.toBeVisible();
                    }

                }).then(() => {
                    // verifying total cost - needs to wait until all previous 4 calculations have returned
                    const calculatedTotalCost: number = Calculation.getTotalCostOfStay(calculatedMealCost, calculatedLodgingCost, specialRequestCost, calculatedFees, calculatedTaxes);
                    // TODO: uncomment - expect.soft(page.locator('#input_1_24')).toHaveText(`${calculatedTotalCost.toFixed(2).replace(/\./,',')} €`);
                });
                // if payment not by credit card, check the box "dans l'impossibilité de payer par CC"
                if (data.payment !== '2') {
                    const noCreditCardCheckbox = await page.locator('#choice_1_112_1');
                    await noCreditCardCheckbox.scrollIntoViewIfNeeded();
                    await noCreditCardCheckbox.check();
                    // choose transfer (0) or cash (1)
                    const paymentMethodRadio = await page.locator(`#choice_1_107_${data.payment}`);
                    await paymentMethodRadio.scrollIntoViewIfNeeded();
                    await paymentMethodRadio.check();
                }
                await page.pause();
                // button "Réserver ma place"
                const summitButtonPage4 = await page.locator('#gform_submit_button_1');
                await summitButtonPage4.scrollIntoViewIfNeeded();
                await summitButtonPage4.click();



                /********************************************************************/
                /************************** Stripe Payment **************************/
                /********************************************************************/


            }
        } catch (error) {
            console.log(`Playwright operation failed: ${(error as Error).message}`);
        }
    })  

})
