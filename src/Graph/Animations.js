import "./Animations.css";
import { getAngle } from "./Helpers";
const ANIMATION_SPEED_MS = 600; //ms
const STEP_SIZE = 5; //ms

//Animate graph traversal
export const animateTraversal = (animations, setAnimateDone) => {

    //Add an attribute to nodes and arrows (isAnimated) and set to true... then use css to handle the animation
    //or use document.getElementById(`node-${node.row}-${node.col}`).className = 'node node-visited';

    for(let i = 0; i<animations.length; ++i){
        if(animations[i].type === "node"){ //Animate node (only have visited property in dict)
            setTimeout(()=>{
                document.getElementById(`node-${animations[i].id}`).classList.add("node-visited");
                document.getElementById(`node-text-${animations[i].id}`).classList.add("node-text-visited");
                // document.getElementById(`node-${animations[i]}`).className = "node-visited";
            }, i * ANIMATION_SPEED_MS);
        }
        else if (animations[i].type === "arrow") { //Animate arrow
            const edges = document.getElementById("animation-edges"); //Get all edges
            const increment = ANIMATION_SPEED_MS / STEP_SIZE;
            const cur_anim = animations[i];

            const distance = Math.sqrt(Math.pow(cur_anim.nodex1 - cur_anim.nodex2, 2) + Math.pow(cur_anim.nodey1 - cur_anim.nodey2, 2));
            const angle = getAngle({x: cur_anim.nodex1, y:cur_anim.nodey1}, {x: cur_anim.nodex2, y: cur_anim.nodey2});
            const startX = cur_anim.nodex1;
            const startY = cur_anim.nodey1;
            //Initialize entire animated arrow at start
            if(cur_anim.stage === "seen"){
                edges.innerHTML += `<line id="temp-${cur_anim.id}-seen" x1=${startX} y1=${startY} x2=${startX} y2=${startY} class="arrow-seen-animate" ></line>`;
            }
            else{
                edges.innerHTML += `<line id="temp-${cur_anim.id}-visited" x1=${startX} y1=${startY} x2=${startX} y2=${startY} class="arrow-visited-animate" ></line>`;
            }
            //Slowly increase length until arrow reaches end coordinates
            for(let j = 0; j<increment; ++j){
                setTimeout( () => {
                    const curX = startX + j / increment * distance * Math.cos(angle);
                    const curY = startY - j / increment * distance * Math.sin(angle);
                    document.getElementById(`temp-${cur_anim.id}-${cur_anim.stage}`).setAttribute("x2", `${curX}`);
                    document.getElementById(`temp-${cur_anim.id}-${cur_anim.stage}`).setAttribute("y2", `${curY}`);
                }, i * ANIMATION_SPEED_MS + j * STEP_SIZE); //Go until i+1
            }

            //Remove temporary arrow and add style to animated arrow
            setTimeout(() => {
                document.getElementById(`temp-${cur_anim.id}-${cur_anim.stage}`).remove();
                if(cur_anim.stage === "seen"){
                    document.getElementById(`arrow-${cur_anim.id}`).classList.add("arrow-seen");
                }
                else{
                    document.getElementById(`arrow-${cur_anim.id}`).classList.add("arrow-visited");
                }
            }, (i+1) * ANIMATION_SPEED_MS);
        }
    }
    //Signal that animation is done to make reset button available
    setTimeout(() => {
        setAnimateDone(true);
    }, ANIMATION_SPEED_MS * animations.length);
}