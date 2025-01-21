import React, { useState } from "react";

const PerMonthInput = () => {
  const [perMonth, setPerMonth] = useState(0); // State for the input value
  const HST_RATE = 0.13; // Example HST rate (update as needed)

  // Calculate the value with HST
  const perMonthWithHST = (perMonth * (1 + HST_RATE)).toFixed(2);

  // Handle input change
  const handleChange = (event) => {
    const value = parseFloat(event.target.value) || 0;
    setPerMonth(value);
  };

  return (
    <div className="column">
      <label htmlFor="per-month">Per Month</label>
      <input
        className="admin"
        type="number"
        id="per-month"
        name="per-month"
        required
        placeholder="Cost Per Month in CAD"
        value={perMonth || ""} // Display value in the input
        onChange={handleChange} // Handle input changes
      />
      <p>With HST: ${perMonthWithHST}</p>
    </div>
  );
};

export default PerMonthInput;
