import * as React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

export default function DatePickerFilter({ date, setDate }) {
    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
                label="Filter by date"
                value={date}
                onChange={setDate}
                slotProps={{
                    textField: {
                        variant: "outlined",
                        size: "small",
                        sx: {
                            backgroundColor: "#23263a",
                            borderRadius: "0.75rem",
                            input: { color: "#facc15" }, // yellow-400
                            "& label": { color: "#facc15" },
                            "& fieldset": { borderColor: "#facc15" },
                            minWidth: "160px"
                        },
                    },
                }}
            />
        </LocalizationProvider>
    );
}
