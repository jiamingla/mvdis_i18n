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
function category(search_table, dmvName, licenseTypeCode) {
    let description_list = [];
    let result_list = [];

    for (const [key, value] of Object.entries(search_table)) {
        const description = value["description"];
        let category_id;
        if (value["secId"] || value["divId"]) {
            category_id = `${value["secId"]}_${value["divId"]}`;
        }
        if (!description_list.includes(description)) {
            description_list.push(description);
            result_list.push({
                dmvName: dmvName,
                licenseTypeCode: licenseTypeCode,
                category_id: category_id ?? 0,
                count: 1,
                description: description,
                date_list: [value["date"]],
            });
        } else {
            // Add date
            for (const [key, result] of Object.entries(result_list)) {
                if (description === result["description"]) {
                    result["category_id"] = category_id ?? 0;
                    result["count"]++;
                    result["date_list"].push(value["date"]);
                }
            }
        }
    }
    return result_list;
}

category(session_example);

module.exports = category;
