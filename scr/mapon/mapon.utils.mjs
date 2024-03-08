import fetch from 'node-fetch';
import { transliterate } from '../bitrix/bitrix.utils.mjs'


async function maponGet() {
    const response = await fetch(`https://mapon.com/api/v1/unit/list.json?key=${process.env.MAPON_API_KEY}`, {
        method: "GET"
    });

    const json = await response.json();

    const { data, error } = json;

    if (error) {
        throw error
    }

    return json;
}

export async function carMillegeByMaponIdOrOlateNumber({ maponId, plateNumber }) {
    const { data } = await maponGet();
    const { units } = data
    const foundById = units.find(unit => unit.unit_id === maponId);

    if (foundById) {
        return { result: 'foundById', unit: foundById }
    }

    const foundByPlaneNumber = units.find(unit => transliterate(unit.number).replace(/\s/g, '') === plateNumber);

    if (foundByPlaneNumber) {
        return { result: 'foundByPlaneNumber', unit: foundByPlaneNumber }
    }

    return { result: null }
}