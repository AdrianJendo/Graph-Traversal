import "./Animations.css";
import { getAngle } from "./Helpers";
export const ANIMATION_SPEED_MS = 600; //ms
const STEP_SIZE = 5; //ms
const SLOW_ANIMATION = 250;

const animateArrow = (cur_anim, i) => {
    const edges = document.getElementById("animation-edges"); //Get all edges
    const increment = ANIMATION_SPEED_MS / STEP_SIZE;

    const distance = Math.sqrt(Math.pow(cur_anim.nodex1 - cur_anim.nodex2, 2) + Math.pow(cur_anim.nodey1 - cur_anim.nodey2, 2));
    const angle = getAngle({x: cur_anim.nodex1, y:cur_anim.nodey1}, {x: cur_anim.nodex2, y: cur_anim.nodey2});
    const startX = cur_anim.nodex1;
    const startY = cur_anim.nodey1;
    //Initialize entire animated arrow at start
    edges.innerHTML += `<line id="temp-${cur_anim.id}-visited" x1=${startX} y1=${startY} x2=${startX} y2=${startY} class="arrow-visited-animate" ></line>`;

    //Slowly increase length until arrow reaches end coordinates
    for(let j = 0; j<increment; ++j){
        setTimeout( () => {
            const curX = startX + j / increment * distance * Math.cos(angle);
            const curY = startY - j / increment * distance * Math.sin(angle);
            document.getElementById(`temp-${cur_anim.id}-visited`).setAttribute("x2", `${curX}`);
            document.getElementById(`temp-${cur_anim.id}-visited`).setAttribute("y2", `${curY}`);
        }, i * ANIMATION_SPEED_MS + j * STEP_SIZE); //Go until i+1
    }

    //Remove temporary arrow and add style to animated arrow
    setTimeout(() => {
        document.getElementById(`temp-${cur_anim.id}-visited`).remove();
        document.getElementById(`arrow-${cur_anim.id}`).classList.add("arrow-visited");
    }, (i+1) * ANIMATION_SPEED_MS);
};

//Animate graph traversals
export const animateTraversal = (animations, setAnimateDone, find_cycle = []) => {

    //Add an attribute to nodes and arrows (isAnimated) and set to true... then use css to handle the animation
    //or use document.getElementById(`node-${node.row}-${node.col}`).className = 'node node-visited';

    for(let i = 0; i<animations.length; ++i){
        if(animations[i].type === "node" && !(find_cycle.length && find_cycle[0] && i===animations.length-1)){ //Animate node (only have visited property in dict)
            setTimeout(()=>{
                document.getElementById(`node-${animations[i].id}`).classList.add("node-visited");
                document.getElementById(`node-text-${animations[i].id}`).classList.add("node-text-visited");
                // document.getElementById(`node-${animations[i]}`).className = "node-visited";
            }, i * ANIMATION_SPEED_MS);
        }
        else if (animations[i].type === "arrow") { //Animate arrow
            animateArrow(animations[i], i);
        }
    }

    if(find_cycle.length) {
        const last_element = animations.length-1;
        setTimeout(() => {
            if(find_cycle[0]){
                document.getElementById(`node-${animations[last_element].id}`).classList.add("node-cycle-found");
                document.getElementById(`node-text-${animations[last_element].id}`).classList.add("node-cycle-found-text");
            }
            setTimeout(() => {
                if(find_cycle[0]) {
                    alert("Cycle found");
                }
                else {
                    alert("No cycle found");
                }
            }, 750);
        }, ANIMATION_SPEED_MS * last_element);
    }

    //Signal that animation is done to make reset button available
    setTimeout(() => {
        setAnimateDone(true);
    }, ANIMATION_SPEED_MS * animations.length + 200);
};

//Animate Dijsktra's Algorithm
export const animateDijkstra = (animations, node_weights, setAnimateDone) => {
    let slow_count = 0;
    for(let i = 0; i<animations.length; ++i){
        if(animations[i].type === "node" && node_weights[animations[i].id] < Infinity){ //Animate node
            setTimeout(()=>{
                document.getElementById(`node-${animations[i].id}`).classList.add("node-visited");
                document.getElementById(`node-text-${animations[i].id}`).classList.add("node-text-visited");
                const weightText = document.getElementById(`node-weight-${animations[i].id}`)
                weightText.classList.add("node-weight-visited");
                weightText.innerHTML = node_weights[animations[i].id] === 0 ? "Start" : node_weights[animations[i].id];
            }, i * ANIMATION_SPEED_MS);
        }
        else if(animations[i].type === "node") { //Unreached nodes
            setTimeout(()=>{
                document.getElementById(`node-${animations[i].id}`).classList.add("node-unreachable");
                document.getElementById(`node-text-${animations[i].id}`).classList.add("node-unreachable-text-visited");
                const weightText = document.getElementById(`node-weight-${animations[i].id}`)
                weightText.classList.add("node-weight-visited");
                weightText.innerHTML = "Infinite";
            }, i * ANIMATION_SPEED_MS + slow_count * SLOW_ANIMATION);
            slow_count++;
        }
        else if (animations[i].type === "arrow") { //Animate arrow
            animateArrow(animations[i], i);
        }
    }
    //Signal that animation is done to make reset button available
    setTimeout(() => {
        setAnimateDone(true);
    }, ANIMATION_SPEED_MS * animations.length + SLOW_ANIMATION * slow_count + 200);
};

//Animate A* Algorithm
export const animateAStar = (animations, setAnimateDone) => {
    for(let i = 0; i<animations.length; ++i){
        if(animations[i].type === "node"){ //Animate node
            setTimeout(()=>{
                document.getElementById(`node-${animations[i].id}`).classList.add("node-visited");
                document.getElementById(`node-text-${animations[i].id}`).classList.add("node-text-visited");
            }, i * ANIMATION_SPEED_MS);
        }
        else if (animations[i].type === "arrow") { //Animate arrow
            animateArrow(animations[i], i);
        }
    }
    //Signal that animation is done to make reset button available
    setTimeout(() => {
        setAnimateDone(true);
    }, ANIMATION_SPEED_MS * animations.length + 200);
};