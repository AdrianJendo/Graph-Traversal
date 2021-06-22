import "./Animations.css";
import { getAngle } from "./Helpers";
const ANIMATION_SPEED_MS = 600; //ms
const STEP_SIZE = 5; //ms

export const animateSearch = (visited_order, animations) => {
    //Animate graph search

    //Add an attribute to nodes and arrows (isAnimated) and set to true... then use css to handle the animation
    //or use document.getElementById(`node-${node.row}-${node.col}`).className = 'node node-visited';

    // console.log(animations);
    for(let i = 0; i<animations.length; ++i){
        if(animations[i].type === "node"){ //Animate node (only visited property)
            setTimeout(()=>{
                document.getElementById(`node-${animations[i].id}`).classList.add("node-visited");
                document.getElementById(`node-text-${animations[i].id}`).classList.add("node-text-visited");
                console.log(document.getElementById(`node-${animations[i].id}`));
                // document.getElementById(`node-${animations[i]}`).className = "node-visited";
            }, i * ANIMATION_SPEED_MS);
        }
        else if (animations[i].type === "arrow") { //Animate arrow
            const edges = document.getElementById("animation-edges");
            
            const increment = ANIMATION_SPEED_MS / STEP_SIZE;
            const cur_anim = animations[i];

            const distance = Math.sqrt(Math.pow(cur_anim.nodex1 - cur_anim.nodex2, 2) + Math.pow(cur_anim.nodey1 - cur_anim.nodey2, 2));
            const angle = getAngle({x: cur_anim.nodex1, y:cur_anim.nodey1}, {x: cur_anim.nodex2, y: cur_anim.nodey2});
            const startX = cur_anim.nodex1;
            const startY = cur_anim.nodey1;
            //Initialize entire arrow at start
            if(cur_anim.stage === "seen"){
                edges.innerHTML += `<line id="temp-${cur_anim.id}-seen" x1=${startX} y1=${startY} x2=${startX} y2=${startY} class="arrow-seen-animate" ></line>`;
            }
            else{
                edges.innerHTML += `<line id="temp-${cur_anim.id}-visited" x1=${startX} y1=${startY} x2=${startX} y2=${startY} class="arrow-visited-animate" ></line>`;
            }
            for(let j = 0; j<increment; ++j){
                setTimeout( () => {
                    //x1=${animations[i].nodex1} y1=${animations[i].nodey1} x2=${animations[i].nodex2} y2=${animations[i].nodey2}
                    const curX = startX + j / increment * distance * Math.cos(angle);
                    const curY = startY - j / increment * distance * Math.sin(angle);
                    try{
                        document.getElementById(`temp-${cur_anim.id}-${cur_anim.stage}`).setAttribute("x2", `${curX}`);
                        document.getElementById(`temp-${cur_anim.id}-${cur_anim.stage}`).setAttribute("y2", `${curY}`);
                    }
                    catch{
                        debugger;
                    }

                }, i * ANIMATION_SPEED_MS + j * STEP_SIZE); //Go until i+1
            }

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
}