import { useState, useEffect } from "react";
import { ROLE_PERMISSIONS } from "../data/rolePermissions";
import { Switch } from '@mui/material';

const [rolePerm, setRolePerm] = useState(ROLE_PERMISSIONS);

export default function AdminPage() {
 
<div
    style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)", // 3 columns
        gridTemplateRows: "repeat(6, auto)",   // 6 rows
        gap: "12px"
    }}
    >
    <div>"Browse all pages"</div>
    <div>
        <BasicSwitches
            checked={rolePerm.Admin[perm]}
            onChange={() => handleToggle("Admin", perm)}
        />
    </div>
    <div></div>

    <div>"Change Date Ranges"</div>
    <div>5</div>
    <div>6</div>

    <div>"Export charts"</div>
    <div>8</div>
    <div>9</div>

    <div> "Choose metrics on page" </div>
    <div>11</div>
    <div>12</div>

    <div>"Tag events/one-off events"</div>
    <div>14</div>
    <div>15</div>

    <div> "Invite/Remove viewers" </div>
    <div>17</div>
    <div>18</div>
</div>


    const handleToggle = (role: "Admin" | "Intern", permission: string) => {
        setRolePerm(prev => ({
        ...prev,
        [role]: {
            ...prev[role],
            [permission]: !prev[role][permission]
        }
        }));
    };

    return(
        <div class="flex flex-col">
            <
            {BasicSwitches(Browse all pages, "BrowsePages")}
             <div className="">
                <p>"Browse all pages"</p>
                    
             </div>

        </div>
    )
}

interface BasicSwitchProps {
  checked: boolean;
  onChange: () => void;
}

export function BasicSwitch(settingName: string, {checked, onChange }: BasicSwitchProps) {
  return (
    <Switch
      checked={checked}
      onChange={onChange}
      color="primary"
    />
  );
}

export function onChange(newRolePerm: boolean, rolePerm: boolean, settingName: string) {
    newRolePerm = rolePerm
    newRolePerm["Admin"][settingName] = True
    setValue(newRolePerm)
}

[rolePerm, setRolePerm] = useState(ROLE_PERMISSIONS)
handleClick() =>
newRolePerm = rolePerm
newRolePerm["Admin"]["BrowsePage"] = True
setValue(newRolePerm)


export function BasicSwitches(settingName: string) {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
       setRolePerm([""]);
    };
  
    return (

    <Switch defaultChecked 
        checked={}
        onChange={handleChange} />
 
  );
}




