// function func(n) {
//     return new Promise((resolve) => {
//         setTimeout(() => {
//             resolve(n + 20);
//         }, 200);
//     });
// }

// (async function () {
//     let array = [1, 2, 3, 4, 5];
//     console.log(array);
//     array = await Promise.all(array.map(e => func(e)));
//     console.log(array);
// })();

function action2(x) {
    throw new Error("Hello, I am an error: " + x);
}

async function action1() {
    return await Promise.all([1].map(x => action2(x)));
}

(async function () {
    try {
        return await action1();
    } catch (e) {
        console.error("ERROR:");
        console.error(e);
    }
})();