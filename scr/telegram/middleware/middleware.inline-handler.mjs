
import { db } from "../../database.mjs"

export async function onInline(query, ctx) {
    const cars = await db
        .selectFrom('cars')
        .select(['id', 'car_num'])
        .execute()

    const filtredCars = cars.filter(car => car.car_num.includes(query))

    if (filtredCars.length > 50) {
        return
    }

    const bottoms = filtredCars.map((car, i) => {
        const { id, car_num } = car
        return {
            type: 'article',
            id: JSON.stringify({ id, car_num }),
            title: car_num,
            input_message_content:
            {
                message_text: car_num
            }
        }
    })

    ctx.answerInlineQuery(bottoms)
    return
}