import { useState, useEffect } from "react";
import { ROLE_PERMISSIONS } from "../data/rolePermissions";
import { Switch } from '@mui/material';




export default function AdminPage() {
    const [rolePerm, setRolePerm] = useState(ROLE_PERMISSIONS);
    const handleToggle = (role: "Admin" | "Intern", perm: string) => {
        setRolePerm(prev => ({
        ...prev,
        [role]: {
            ...prev[role],
            [perm]: !prev[role][perm] //* see comments in data file 
        }
        }));
    }
    return(
        // Row #1
        <div className="grid grid-cols-3 grid-flow-row gap-6 p-5">
            <div className="text-gray-500 font-medium">Permissions</div>
            <div className="text-gray-500 font-medium text-center">Admin</div>
            <div className="text-gray-500 font-medium text-center">Intern</div>
        <div className="grid grid-cols-3 gap-y-6">

                <div> Browse all pages
                    <div className="flex justify-center">
                    <Switch
                        checked= {rolePerm.Admin["Browse all pages"]}
                        // on change tells the handler what do when the toggle is change
                        // so when it is changed then it calls the handle Toggle function to
                        // change from true to false or false to true
                        onChange={()=> handleToggle("Admin","Browse all pages")}
                    />
                    </div>
                    <div>
                    <Switch
                        checked= {rolePerm.Intern["Browse all pages"]}
                        onChange={()=> handleToggle("Intern","Browse all pages")}
                    />
                    </div>
                </div>
        </div>
        </div>

    );
    }




//     return(
//         <div class="flex flex-col">
//             <
//             {BasicSwitches(Browse all pages, "BrowsePages")}
//              <div className="">
//                 <p>"Browse all pages"</p>
                    
//              </div>

//         </div>
//     )
// }

// interface BasicSwitchProps {
//   checked: boolean;
//   onChange: () => void;
// }

// export function BasicSwitch(settingName: string, {checked, onChange }: BasicSwitchProps) {
//   return (
//     <Switch
//       checked={checked}
//       onChange={onChange}
//       color="primary"
//     />
//   );
// }

// export function onChange(newRolePerm: boolean, rolePerm: boolean, settingName: string) {
//     newRolePerm = rolePerm
//     newRolePerm["Admin"][settingName] = True
//     setValue(newRolePerm)
// }

// [rolePerm, setRolePerm] = useState(ROLE_PERMISSIONS)
// handleClick() =>
// newRolePerm = rolePerm
// newRolePerm["Admin"]["BrowsePage"] = True
// setValue(newRolePerm)


// export function BasicSwitches(settingName: string) {
//     const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//        setRolePerm([""]);
//     };
  
//     return (

//     <Switch defaultChecked 
//         checked={}
//         onChange={handleChange} />
 
//   );
// }




