var loader = document.getElementById("loader");
console.log("Loader: " + loader);

var observer = new MutationObserver(function(mutations, observer){
    var doc = mutations[0].target.ownerDocument;
    var mutationCount = Object.keys(mutations).length;
    var before = mutations[0].oldValue;
    var after = mutations[mutationCount-1].target.getAttribute("value");
    //console.log("Before: " + before + "\tAfter: " + after);
    
    doc.getElementById("text").textContent = after + "%";

    //Now the fun part
    var arcWidth = parseInt(doc.getElementById("outerArc").style.strokeWidth);
    var radius = 25;
    var radiusDest = 45;
    var radiusDelta = radiusDest - radius;
    var destScale = radiusDest/radius;
    var destScaleInv = 1/destScale;
    var centre = 50;
    var startAng = 2 * Math.PI * before/100
    var endAng = 2 * Math.PI * after/100
    var deltaAng = endAng - startAng;
    var start = {
        x: centre + radius * Math.sin(startAng),
        y: centre + radius * Math.cos(startAng)
    };
    var end = {
        x: centre + radius * Math.sin(endAng),
        y: centre + radius * Math.cos(endAng)
    };
    /*var dest = {
        x: radiusDelta * Math.sin(startAng + deltaAng),
        y: radiusDelta * Math.cos(startAng + deltaAng)
    };*/
    var dest = {
        x: -radiusDest + arcWidth,
        y: -radiusDest + arcWidth
    };
    console.log("Arc from " + start.x + ", " + start.y
        + " to " + end.x + ", " + end.y
        + " at " + dest.x + ", " + dest.y
        + " scale " + destScale
        + " stroke " + arcWidth
    );
    
    
    var segment = doc.createElementNS("http://www.w3.org/2000/svg", 'g');
    var arc = doc.createElementNS("http://www.w3.org/2000/svg", 'path');
        arc.setAttribute("d",
            "M " + start.x + " " + start.y +
            " A " + radius + " " + radius + " 0 0 0 " + end.x + " " + end.y
        );
        arc.setAttribute("style", "stroke: #920095; stroke-width: " + (arcWidth * destScaleInv) + "; fill: none;");
    segment.appendChild(arc);
    var duration = (1 + Math.random() * 4) + "s";
    var begin = mutations[0].target.getCurrentTime() + "s"
    var motion = doc.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
        motion.setAttribute("begin", begin);
        motion.setAttribute("dur", duration);
        motion.setAttribute("attributeName", "transform");
        motion.setAttribute("type", "translate");
        motion.setAttribute("from", "0 0");
        motion.setAttribute("to", dest.x + " " + dest.y);
        motion.setAttribute("fill", "freeze");
    segment.appendChild(motion);
    var scale = doc.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
        scale.setAttribute("begin", begin);
        scale.setAttribute("dur", duration);
        scale.setAttribute("attributeName", "transform");
        scale.setAttribute("type", "scale");
        scale.setAttribute("from", "1");
        scale.setAttribute("to", destScale);
        scale.setAttribute("fill", "freeze");
        scale.setAttribute("additive", "sum");
    segment.appendChild(scale);
    mutations[0].target.appendChild(segment);
});
observer.observe(loader, {attributes: true, attributeOldValue: true});

//Fake updates
setInterval(function(){
    var value = Math.round(loader.getAttribute("value"));
    var max = Math.round(loader.getAttribute("max"));
    if(value >= max) return;
    
    var step = Math.min(max - value, Math.round(Math.random() * 7));
    loader.setAttribute("value", value + step);
   //console.log("Set value to: " + value);
}, 1000);