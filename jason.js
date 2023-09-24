"use strict";
//these constants will be used for probabilities and intrervals
const START = 0;
const STOP = 1;

//CLASSES   

//a Class for our Murderer, he has a name, some hp, and can take dmg
//isAlive() informs his actual state and toString() outputs that state
class Murderer {
    constructor(name, hp) {
        this.name = name;
        this.hp = hp;
    }

    takeDmg(dmg) {
        this.hp = this.hp - dmg;
    }

    isAlive() {
        return (this.hp > 0);
    }

    toString() {
        if (this.hp > 0) {
            return `${this.name} has still ${this.hp} HP remaining.`;
        } else {
            return `${this.name} died !`;
        }
        
    }
}

//A class for our survivors, they have a name and a characteristic. They have three methods/actions possible : Die, Dodge or Attack
//But they also have probabilities for each of these 3 actions. And finally isAlive() informs their actual state
class Survivor {
    constructor(name, characteristic, probDying, probDodging, probAttacking) {
        this.name = name;
        this.characteristic = characteristic;
        this.probDying = probDying;
        this.probDodging = probDodging;
        this.probAttacking = probAttacking;
        this.alive = true;
    }

    die() {
        let dmg = 0;
        this.alive = false;
        return dmg;
    }

    dodge() {
        let dmg = 10;
        return dmg;
    }

    attack() {
        let dmg = 15;
        this.alive = false;
        return dmg;
    }

    isAlive() {
        return (this.alive);
    }

}

//A class used later to simplify some tests about the probabilities
class Interval {
    constructor(start, stop) {
        this.start = start;
        this.stop = stop;
    }

    contains(number) {
        if (number >= this.start && number < this.stop) {
            return true;
        } else {
            return false;
        }
    }
} 


//FUNCTIONS

//this functions will transform the probabilities into interval objects, that will be useful for testing
//returns an array of 3 intervals
function createIntervals (prob1, prob2) {
    let result = [];
    result[0] = new Interval (START, prob1);
    result[1] = new Interval (prob1, prob1+prob2);
    result[2] = new Interval (prob1+prob2, STOP);
    return result;
}

//this function take as parameters : the nbr of Survivors desired, an array of names-characteristics-intervals
//returns an array of  the desired Survivors with randomized names+characteristics
function createSurvivors(nbrSurvivors, survivorNames, survivorChars, probs) {
    let survivors = [];
    for (let i = 0; i < nbrSurvivors; i++) {
        let nameIndex = Math.floor(Math.random() * survivorNames.length);
        let charIndex = Math.floor(Math.random() * survivorChars.length);
        let survivor = new Survivor (survivorNames[nameIndex], survivorChars[charIndex], probs[0], probs[1], probs[2]);
        survivors.push(survivor);
        survivorNames.splice(nameIndex, 1);
        survivorChars.splice(charIndex, 1);
    }
    return survivors;
}

//simple function that checks if all the survivors are dead
function isEveryoneDead(survivors) {
    let allDead = true;
    survivors.forEach( (survivor) => {
        if (survivor.isAlive()) {
            allDead = false;
        }
    });
    return allDead;
}

//simple function that checks if all the survivors are still alive
function isEveryoneAlive(survivors) {
    let allAlive = true;
    survivors.forEach( (survivor) => {
        if (!survivor.isAlive()) {
            allAlive = false;
        }
    });
    return allAlive;
}

//simple function that returns all the dead survivors
function pressF(survivors) {
    let result = "<ul>";
    survivors.forEach( (survivor) => {
        if (!survivor.isAlive()) {
            result += `<li>${survivor.name+survivor.characteristic}</li>`;
        }
    });
    result += "</ul>";
    return result;
}

//our main function that will run the whole thing
//it takes an object Murderer and an array of object Survivors as parameters
function main (survivors, murderer) {
    //variable used for the html output
    let outputHTML = `<p><i>Murderer : ${murderer.name}; Murderer's Health : ${murderer.hp} HP; Nbr of Survivors : ${survivors.length}</i></p>`;

    while(!isEveryoneDead(survivors) && murderer.isAlive()) { //While the murderer is still alive and at least one survivor is alive too
        survivors.forEach( (survivor) => {  //We go through all the survivors
            if (survivor.isAlive()) {       //the survivors acts if he's alive       
                let seed = Math.random();
                let result = "";
                
                //we will use the contains method from the interval class to test the probabilities of actions
                if (survivor.probDying.contains(seed)) {
                    murderer.takeDmg(survivor.die());    //The murderer takes no dmg and the survivor dies
                    result =`<p>${murderer.name} brutally murdered ${survivor.name+survivor.characteristic} ! ${murderer.toString()}</p>`;
                } else if (survivor.probDodging.contains(seed)) {
                    murderer.takeDmg(survivor.dodge());  //The survivor dodges and deals dmg to the murderer
                    result =`<p>${survivor.name+survivor.characteristic} sucessfuly dodged ${murderer.name} and dealt 10 dmg ! ${murderer.toString()}</p>`;
                } else if (survivor.probAttacking.contains(seed)) {
                    murderer.takeDmg(survivor.attack()); //The survivor dies but manages to deal dmg to the murderer
                    result =`<p>${survivor.name+survivor.characteristic} dealt 15 dmg to ${murderer.name} but died in the process ! ${murderer.toString()}</p>`;
                } else {
                    result ="<p>error with the probabilities</p>";
                }

                outputHTML+=result;
                console.log(result);

            }
        });
    }

    //We will now outptut one last sentence as a conclusion
    let conclusion = "";
    if (murderer.isAlive()) {   //if the murderer is still alive, he killed everybody
        conclusion =`<p>${murderer.name} killed everybody ...</p>`;
    } else {                    // if the murerder is dead
        if (isEveryoneDead(survivors)) {            //but the survivors are dead too, they killed each other
            conclusion =`<p>The survivors stopped the murderer ${murderer.name} but ${murderer.name} managed to kill them all too ! A total bloodbath !</p>`;
        } else if (isEveryoneAlive(survivors)) {    //and the survivors are all alive, they completly won
            conclusion =`<p>The survivors stopped the murderer ${murderer.name} and nobody died, a total victory !</p>`;
        } else {                                    //and some survivors died, they won but paid a price
            conclusion =`<p>The survivors stopped the murderer ${murderer.name} but some lost their lives, RIP to :</p>`;
            conclusion += pressF(survivors);//list of the dead ones
        }
    }

    outputHTML+=conclusion;
    console.log(conclusion);

    //output in HTML
    document.getElementById("htitle").innerHTML = `${murderer.name} is on a killing spree`;
    document.getElementById("content").innerHTML = outputHTML;
}

//TESTING

//We assign the three probabilties and transform them in intervals
//The total of the probabilities must be 1 !!!
let myProbDying = 0.2;
let myProbDodging = 0.5;
let myProbAttacking = 0.3;
let myProbs = createIntervals (myProbDying, myProbDodging);

//With an array of names-characteristics-intervals, we create a randomized array of 5 Survivors (maximum 8 possible in this case)
let myNames = ["Mike", "Jess", "Jeff", "Kate", "Chris", "Jenny", "John", "Ashley"];
let myCharacteristics = [" the Athlete", " the Popular One", " the Nerd", " the Blond(e)", " the Emo", " the Junky", " The Sheriff", " The Wimp"];
let mySurvivors = createSurvivors(5, myNames, myCharacteristics, myProbs);

//we assign a murderer
let myMurderer = new Murderer("Jason", 100);


main(mySurvivors, myMurderer);//everything is ready for the main function





