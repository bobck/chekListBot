import { db } from '../../database.mjs';
import { devLog } from '../../utils.mjs';

export async function onInline(query, ctx) {
  try {
    devLog(`Telegram API: received inline query for '${query}'`);
    const cars = await db.selectFrom('cars').select(['id', 'car_num']).execute();

    const filtredCars = cars.filter((car) => car.car_num.includes(query));

    if (filtredCars.length > 50) {
      return;
    }

    const bottoms = filtredCars.map((car, i) => {
      const { id, car_num } = car;
      return {
        type: 'article',
        id: JSON.stringify({ id, car_num }),
        title: car_num,
        input_message_content: {
          message_text: car_num,
        },
      };
    });

    devLog(`Telegram API: answering inline query with ${bottoms.length} results`);
    ctx.answerInlineQuery(bottoms);
    return;
  } catch (error) {
    devLog(`Telegram API Error: onInline failed - ${error.message}`);
    console.error({ type: 'onInline Error', error });
  }
}
