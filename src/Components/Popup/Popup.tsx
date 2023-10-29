import { useState, useEffect } from 'react';

export const Popup = () => {
	const [medicalCondition, setMedicalCondition] = useState(false);
	const [clicked, setClicked] = useState(false);
	useEffect(() => {
		if (localStorage.getItem("medicalCondition") == "true") 
			setMedicalCondition(true);
	}, [medicalCondition]);
	useEffect(() => {
		if (localStorage.getItem("isClicked") == "true") {
			setClicked(true);
		}
	}, []);
	function handlePopupClick(e) {
		e.preventDefault();
		setClicked(true);
		localStorage.setItem("isClicked", "true");
	} 
	return (
		<div>
			{clicked ? <div></div> : <button onClick={handlePopupClick}>
			 	click me
			</button>}
		</div>
	);
}