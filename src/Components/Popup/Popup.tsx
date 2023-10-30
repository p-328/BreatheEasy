import { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

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
		localStorage.setItem("medicalCondition", "true");
		setMedicalCondition("Yes");
	} 
	function handleNo(e) {
		e.preventDefault();
		localStorage.setItem("isClicked", "true");
		setClicked(true);
		localStorage.setItem("medicalCondition", "false");
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