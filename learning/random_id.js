const LOCATION_VALUES = {
    A: 1,
    B: 10,
    C: 19,
    D: 28,
    E: 37,
    F: 46,
    G: 55,
    H: 64,
    I: 39,
    J: 73,
    K: 82,
    L: 2,
    M: 11,
    N: 20,
    O: 48,
    P: 29,
    Q: 38,
    R: 47,
    S: 56,
    T: 65,
    U: 74,
    V: 83,
    W: 21,
    X: 3,
    Y: 12,
    Z: 30,
};

/**
 * 檢查或是產生的模式。
 */
const Mode = {
    Default: 0,
    National: 1,
    Resident: 2,
};

/**
 * 性別。
 *
 * 國民身分證統一編號：男性為1；女性為2。
 * 新式外來人口統一證號：男性為8；女性為9。
 */
const Sex = {
    Male: 0,
    Female: 1,
};

const calculateValue = (text) => {
    let value = LOCATION_VALUES[text[0]];

    for (let i = 1; i < 9; i++) {
        value += (text.charCodeAt(i) - 48) * (9 - i);
    }

    return value;
};

/**
 * 檢查國民身分證統一編號或是新式外來人口統一證號。
 */
const check = (text, mode = Mode.Default) => {
    switch (mode) {
        case Mode.National:
            if (!/^[A-Z][12]\d{8}$/.test(text)) {
                return false;
            }
            break;
        case Mode.Resident:
            if (!/^[A-KM-QT-XZ][89]\d{8}$/.test(text)) {
                return false;
            }
            break;
        default:
            // Mode.Default
            if (
                !/^(?:(?:[A-KM-QT-XZ][1289])|(?:[LRSY][12]))\d{8}$/.test(text)
            ) {
                return false;
            }
            break;
    }

    const value = calculateValue(text) + text.charCodeAt(9) - 48;

    return value % 10 === 0;
};

/**
 * 產生國民身分證統一編號或是新式外來人口統一證號。
 */
const generate = (mode = Mode.Default, sex) => {
    let location;
    let sexNumber;

    switch (mode) {
        case Mode.National:
            switch (sex) {
                case Sex.Male:
                    sexNumber = 1;
                    break;
                case Sex.Female:
                    sexNumber = 2;
                    break;
                default:
                    sexNumber = Math.floor(Math.random() * 2) + 1;
            }
            break;
        case Mode.Resident:
            switch (sex) {
                case Sex.Male:
                    sexNumber = 8;
                    break;
                case Sex.Female:
                    sexNumber = 9;
                    break;
                default:
                    sexNumber = Math.floor(Math.random() * 2) + 8;
            }
            break;
        default:
            // Mode.Default
            switch (sex) {
                case Sex.Male:
                    sexNumber = Math.floor(Math.random() * 2) + 1;

                    if (sexNumber === 2) {
                        sexNumber = 8;
                    }
                    break;
                case Sex.Female:
                    sexNumber = Math.floor(Math.random() * 2) + 1;

                    if (sexNumber === 1) {
                        sexNumber = 9;
                    }
                    break;
                default:
                    sexNumber = Math.floor(Math.random() * 4) + 1;

                    if (sexNumber >= 3) {
                        sexNumber += 5;
                    }
            }

            break;
    }

    if (sexNumber <= 2) {
        // National
        location = String.fromCharCode(Math.floor(Math.random() * 26) + 65);
    } else {
        // Resident
        let rnd = Math.floor(Math.random() * 22);

        if (rnd >= 21) {
            rnd += 4;
        } else if (rnd >= 16) {
            rnd += 3;
        } else if (rnd >= 11) {
            rnd += 1;
        }

        location = String.fromCharCode(rnd + 65);
    }

    const seq = Math.floor(Math.random() * 10000000)
        .toString()
        .padStart(7, "0");

    const prefix = `${location}${sexNumber}${seq}`;

    const value = calculateValue(prefix);
    const checkNumber = (10 - (value % 10)) % 10;

    return `${prefix}${checkNumber}`;
};

const id = generate(2); // e.g. "A123456789"

console.log(check(id)); // true
console.log(id); // true
module.exports = {
    LOCATION_VALUES,
    Mode,
    Sex,
    calculateValue,
    generate,
};
