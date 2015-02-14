var 
	// BODYWIDTH = 25.0,
	// BODYHEIGHT = 15.0,
	HEADWIDTH = BODYWIDTH,
	HEADHEIGHT = BODYHEIGHT / 5,
	// NUMEYES = 1,
	BUTTWIDTH = BODYWIDTH,
	ARMWIDTH = 15,
	// ARMLENGTH = 20,
	LEGWIDTH = 3.0,
	// LEGLENGTH = 5.0,
	FOOTLENGTH = LEGLENGTH * 1.25 + LEGWIDTH * 0.8,
	FOOTHEIGHT = FOOTLENGTH * 0.625;
	FEETOPENANGLE = 60,
	HANDSIZE = 10;
	
var objs = new Array();

function head(radius, height) {
	return union(
				difference(
						sphere({r: radius}),
						cube({size: radius * 2}).scale([1, 1, 0.5]).translate([-radius, -radius, -radius])
					).translate([0, 0, height]),
				cylinder({r1: radius, r2: radius, h: height})
			);
}

function eyes(numEyes, headRadius, globalTransform) {

	numEyes = Math.min(numEyes, 3);

	var rEye = headRadius / numEyes / Math.sqrt(3 + numEyes);
	rEye = Math.min(rEye, headRadius / 3);
	var rOuterSocket = rEye * 1.75;
	var rInnerSocekt = rEye * 1.25;
	var dSocket = headRadius / 3 / numEyes;

	var eyes = new Array();

	globalTransform[1] -= dSocket * 0.5;

	for(var i=0; i<numEyes; i++) {
	var eyeSocket = difference(
						cylinder({r1: rOuterSocket, r2: rOuterSocket, h: dSocket}),
						sphere({r: rInnerSocekt}).translate([0, 0, rInnerSocekt])
						);
	var eyeBall = difference (
					sphere({r: rEye}),
					cube({size: 2 * rEye}).translate([-rEye, -rEye, -2 * rEye])
				);
	eyes.push(
			union (
				eyeSocket,
				eyeBall.translate([0, 0, rEye / 2])
				).rotateY(180).rotateX(90).translate([rOuterSocket * 2 * (i - 0.5 * (numEyes - 1)), 0, 0]).translate(globalTransform)
			);
	}

	return eyes;
}

function body(radius, height) {
	return cylinder({r1: radius, r2: radius, h: height});
}

// function hand(dim) {
// 	var thumb = sphere({r: dim * 0.45}).scale([1, 0.45, 0.45]).translate([dim * 0.45 / 2, 0, 0]).rotateZ(-50);
// 	var indexFinger = sphere({r: dim * 0.5}).scale([1, 0.35, 0.35]).translate([0, dim * 0.5, 0]).rotateZ(15);
// 	return union(
// 			thumb,
// 			indexFinger
// 		);
// }

function arm(length, width) {
	var rArm = width / 8;
	var rFist = rArm;

	var scaleFactor = (ARMLENGTH - 5) / 10.0;

	return union(
				intersection(
					torus({ ri: rArm, ro: rArm + width / 2 }),
					cube({size: rArm * 2 + width}).translate([0, 0, -rArm - width/2])
				),
				sphere({r: rFist}).scale([1/scaleFactor, 1/0.5, 1/0.5]).translate([0, (width + rFist)/2, 0])
		).scale([scaleFactor, 0.5, 0.5]);
}

function arms(length, width, bodyWidth, bodyHeight) {
	var leftArm = arm(length, width).rotateY(-90).rotateZ(90);
	var rightArm = arm(length, width).rotateX(180).rotateY(-90).rotateZ(90);

	return union(
			leftArm.translate([-bodyWidth * 0.5 + width/8, 0, 0]),
			rightArm.translate([bodyWidth * 0.5 - width/8, 0, 0])
		);
}

function legs(radius, height) {
	var leftLeg = cylinder({r1: radius, r2: radius, h: height});
	var rightLeg = cylinder({r1: radius, r2: radius, h: height});

	return union (
		leftLeg.translate([-radius * 2, 0, 0]),
		rightLeg.translate([radius * 2, 0, 0])
		);
}

function feet(length, height, legRadius, openAngle) {
	var leftFoot = difference (
			sphere({r: length / 2}).scale([1.0, 0.5, height / length]),
			cube({size: length}).scale([1.0, 0.5, height / length]).translate([-length / 2, -length / 4, -height])
		);
	var rightFoot = difference (
			sphere({r: length / 2}).scale([1.0, 0.5, height / length]),
			cube({size: length}).scale([1.0, 0.5, height / length]).translate([-length / 2, -length / 4, -height])
		);
	
	var spacing = legRadius * 2 + (length / 2 - legRadius) * Math.sin(openAngle/2 * Math.PI / 180);
	return union (
			leftFoot.rotateZ(openAngle/2).translate([0, -spacing, 0]),
			rightFoot.rotateZ(-openAngle/2).translate([0, spacing, 0])
		);
}

function butt(radius) {
	var r2 = radius * sqrt(2);
	return difference (
			sphere({r: r2}),
			cube({size: r2 * 2}).scale([1, 1, 1]).translate([-r2, -r2, -radius])
		);
}

function makeMinionParts() {

}

function makeMinion(){
	objs.push(
		union(
			body(BODYWIDTH / 2, BODYHEIGHT),

			head(HEADWIDTH / 2, HEADHEIGHT).translate([0, 0, BODYHEIGHT]),

			eyes(NUMEYES, HEADWIDTH / 2, [0, BODYWIDTH/2, BODYHEIGHT * 1.25]),

			butt(BUTTWIDTH / 2).translate([0, 0, BUTTWIDTH / 2]),

			legs(LEGWIDTH / 2, LEGLENGTH).translate([0, -BUTTWIDTH/12, -BUTTWIDTH/3]),

			feet(FOOTLENGTH, FOOTHEIGHT, LEGWIDTH / 2, FEETOPENANGLE).rotateZ(-90).translate([0, 0, -BUTTWIDTH/3 ]),

			arms(ARMLENGTH, ARMWIDTH, BODYWIDTH, BODYHEIGHT)

		).translate([0, 0, 10])
	);
}

function main() {
	makeMinion();
	return objs;
}