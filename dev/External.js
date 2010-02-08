////////////////////////////////////////////////////////////////////////////////
//
//  External
//
//  Copyright (c) 2009 Jon Thompson
//
////////////////////////////////////////////////////////////////////////////////
//
/// \file External.js
/// \brief External interface for the extension to use
/// \author Jon Thompson
/// \created March 3, 2009
//
////////////////////////////////////////////////////////////////////////////////

/*******************************************************************************
   Copyright 2010 Jon Thompson (www.initiativetracker.com)

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*******************************************************************************/


// An external event for adding a combatant
if (BROWSER == B_Firefox)
{
    window.addEventListener("ExternalAddCombatant",
    function (evt)
    {
        try
        {
            // Get the data passed in by the extension
            var lstData = dojo.fromJson(evt.target.getAttribute("ExternalAddCombatantData"));
            evt.target.setAttribute("ExternalAddCombatantData", "");        
            
            // Try to parse each HTML
            for (var iPage = 0; iPage < lstData.length; ++iPage)
            {
                // Try parsing the HTML
                var hParsed = MonsterParser.ParseHTML(lstData[iPage].HTML);
                
                // Check if there was any success
                if (hParsed.Name || hParsed.HP || hParsed.Initiative)
                {
                    PromptAddCombatant.Instance.Show(lstData[iPage].URL, hParsed.Name, SafeParseInt(hParsed.HP), SafeParseInt(hParsed.Initiative));
                    return;                
                }
            }
            
            // If we got here then just use the first
            PromptAddCombatant.Instance.Show(lstData[0].URL);
        }
        catch(e)
        {
            alert("Error recieving data from the extension.");
        }   
    }
    ,false);
}