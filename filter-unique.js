for (var i=0; i<obj.length; i++) {
	found = false;
	for (var j=0; j<obj1.length; j++) {
		if (obj[i].presetID === obj1[j].presetID) {
			found=true;
			break;
        }
    }
	if (!found) obj1.push(obj[i]);
}