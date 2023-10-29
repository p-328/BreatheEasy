import { useState, useEffect } from 'react';
export const Popup = () => {
	const [medicalCondition, setMedicalCondition] = useState("");
	const [clicked, setClicked] = useState(false);
	useEffect(() => {
		setMedicalCondition(localStorage.getItem("medicalCondition"));
	}, []);
	useEffect(() => {
		if (localStorage.getItem("isClicked") == "true")
			setClicked(true);
	}, []);
	function handleYes(e) {
		e.preventDefault();
		localStorage.setItem("isClicked", "true");
		setClicked(true);
		localStorage.setItem("medicalCondition", "Yes");
		setMedicalCondition("Yes");
	} 
	function handleNo(e) {
		e.preventDefault();
		localStorage.setItem("isClicked", "true");
		setClicked(true);
		localStorage.setItem("medicalCondition", "No");
		setMedicalCondition("No");
	}
	return (
		<div>
			{
				!clicked ?  
					<div>
						<p>Do you have a medical condition that is associated with respiratory issues (pneumonia, bronchitis, etc.)?</p>
						<br />
						<button onClick={handleYes}>
						 	Yes
						</button>
						<button onClick={handleNo}>
							No
						</button>
					</div>
					: <div></div> 
			}
		</div>
	)
}