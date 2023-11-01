import { useState, useEffect } from 'react';

export const Popup = () => {
	const [clicked, setClicked] = useState(false);
	useEffect(() => {
		if (localStorage.getItem("isClicked") == "true")
			setClicked(true);
	}, []);
	function handleYes(e: any) {
		e.preventDefault();
		localStorage.setItem("isClicked", "true");
		setClicked(true);
		localStorage.setItem("medicalCondition", "true");
	} 
	function handleNo(e: any) {
		e.preventDefault();
		localStorage.setItem("isClicked", "true");
		setClicked(true);
		localStorage.setItem("medicalCondition", "false");
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