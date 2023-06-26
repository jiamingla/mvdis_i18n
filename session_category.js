const session_example = require("./session_example.json");
// console.table(session_example[0]["description"]);
/*
要加入的:
檔名: 駕照等級_dmvNo.json
result:
[
    {
        "category_id",
        "count",
        "description",
        "date_list":[
        ]
    }
]
*/
let description_list = [];
let result_list = [];

for (const [key, value] of Object.entries(session_example)) {
    const description = value["description"];
    console.log(`${description}`);
    if (!description_list.includes(description)) {
        description_list.push(description);
        result_list.push({
            category_id: 0,
            count: 1,
            description: description,
            date_list: [value["date"]],
        });
    } else {
        // Add date
        for (const [key, result] of Object.entries(result_list)) {
            if (description === result["description"]) {
                result["count"]++;
                result["date_list"].push(value["date"]);
            }
        }
    }
}
console.group(result_list);