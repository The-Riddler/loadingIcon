/*
Copyright (C) 2015  Jordan Vincent
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var loader = document.getElementById("loader");
console.log("Loader: " + loader);

var observer = new MutationObserver(function(mutations, observer){
    var doc = mutations[0].target.contentDocument;
    var mutationCount = Object.keys(mutations).length;
    var before = mutations[0].oldValue;
    var after = mutations[mutationCount-1].target.getAttribute("value");
	var currentTime = doc.firstElementChild.getCurrentTime();
    //console.log("Before: " + before + "\tAfter: " + after);
    
    doc.getElementById("text").textContent = after + "%";

    //Now the fun part
    var arcWidth = parseInt(doc.getElementById("outerArc").style.strokeWidth);
    var radius = 1;
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
        x: centre + radius * Math.sin(endAng + 0.008), //~= half an extra degree
        y: centre + radius * Math.cos(endAng + 0.008)
    };
    /*var dest = {
        x: radiusDelta * Math.sin(startAng + deltaAng),
        y: radiusDelta * Math.cos(startAng + deltaAng)
    };*/
    var dest = {
        x: -(centre * destScale - centre),
        y: -(centre * destScale - centre)
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
    var duration = (1 + Math.random() * 1) + "s";
    var begin = currentTime + "s"
    var motion = doc.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
        motion.setAttribute("begin", begin);
        motion.setAttribute("dur", duration);
        motion.setAttribute("attributeName", "transform");
        motion.setAttribute("type", "translate");
        motion.setAttribute("from", "0 0");
        motion.setAttribute("to", dest.x + " " + dest.y);
        motion.setAttribute("values", "0 0; " + dest.x + " " + dest.y);
        motion.setAttribute("fill", "freeze");
        motion.setAttribute("calcMode", "spline");
        motion.setAttribute("keySplines", "0.16 0.015 1 0.045");
    segment.appendChild(motion);
    var scale = doc.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
        scale.setAttribute("begin", begin);
        scale.setAttribute("dur", duration);
        scale.setAttribute("attributeName", "transform");
        scale.setAttribute("type", "scale");
        scale.setAttribute("from", "1");
        scale.setAttribute("to", destScale);
        scale.setAttribute("fill", "freeze");
        scale.setAttribute("calcMode", "spline");
        scale.setAttribute("keySplines", "0.16 0.015 1 0.045");
        scale.setAttribute("values", "1; " + destScale);
        scale.setAttribute("additive", "sum");
    segment.appendChild(scale);
    doc.firstElementChild.appendChild(segment);
});
observer.observe(loader, {attributes: true, attributeOldValue: true});

//Fake updates
setTimeout(function(){
    var value = Math.round(loader.getAttribute("value"));
    var max = Math.round(loader.getAttribute("max"));
    if(value >= max) return;
    
    var step = Math.min(max - value, Math.round(Math.random() * 7));
    loader.setAttribute("value", value + step);
   //console.log("Set value to: " + value);
    setTimeout(arguments.callee, Math.random() * 1000);
}, 1000);