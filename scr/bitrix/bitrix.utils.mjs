import { Bitrix } from '@2bad/bitrix'
const bitrix = Bitrix(`https://${process.env.BITRIX_PORTAL_HOST}/rest/${process.env.BITRIX_USER_ID}/${process.env.BITRIX_API_KEY}/`)

export async function listCars() {

    const response = await bitrix.list('crm.item.list', { entityTypeId: '138', select: ['ufCrm4_1654801473656', 'ID'] })
    const { result } = response
    return result
}

export function transliterate(word) {
    let answer = ''
    const converter = {
        'а': 'a', 'в': 'b',
        'е': 'e', 'к': 'k', 'м': 'm', 'н': 'n',
        'о': 'o', 'р': 'p', 'с': 'c', 'т': 't',
        'х': 'x',

        'А': 'A', 'В': 'B',
        'Е': 'E', 'К': 'K', 'М': 'M', 'Н': 'H',
        'О': 'O', 'Р': 'P', 'С': 'C', 'Т': 'T',
        'Х': 'X', 'І': 'I', 'У': 'Y'
    };

    for (let i = 0; i < word.length; ++i) {
        if (converter[word[i]] == undefined) {
            answer += word[i];
        } else {
            answer += converter[word[i]];
        }
    }

    return answer;
}

if (process.env.ENV == 'dev') {
    const result = await listCars()
    console.log({ result })
}


