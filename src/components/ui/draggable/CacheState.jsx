let states = [];
let currentIndex = 0;


let getPrevState = () => {
    console.log(currentIndex);
    let prevState = states[currentIndex - 1];
    if (prevState) {
        currentIndex -= 1;
        return prevState;
    }
    return states[0];
};

let getNextState = () => {
    let nextState = states[currentIndex + 1];
    if (nextState) {
        currentIndex += 1;
        return nextState;
    }
    return states[currentIndex];
};


let pushState = (state) => {
    console.log(state);
    states = states.slice(0, currentIndex);
    currentIndex += 1;
    let copyState = JSON.stringify(state);
    states.push(JSON.parse(copyState));
};

export default {pushState, getPrevState, getNextState}
