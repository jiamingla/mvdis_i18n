import * as twIdNum from "tw-id-num";

const id = twIdNum.generate(twIdNum.Mode.National); // e.g. "A123456789"

console.log(twIdNum.check(id)); // true
console.log(id); // true
