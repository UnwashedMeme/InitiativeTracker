////////////////////////////////////////////////////////////////////////////////
//
//  Combatant Class
//
//  Copyright (c) 2009 Jon Thompson
//
////////////////////////////////////////////////////////////////////////////////
//
/// \file CombatantList.Instance.js
/// \brief Represents a single combatant in the list
/// \author Jon Thompson
/// \created January 25, 2009
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



dojo.declare("Combatant", null, 
{

// Constructor
constructor: function Combatant(a_sURL, a_sName, a_nHP, a_nBaseInitiative, a_nInitiative)
{
    // All combatants have a unique ID
    
    this.UniqueID = GetUniqueID();

    // Set the basic parameters
    
    this.URL = a_sURL;
    this.Name = a_sName;
    this.HP = a_nHP;
    this.BaseInitiative = a_nBaseInitiative;
    this.Initiative = a_nInitiative;
},

// Duplicate the combatant
Duplicate: function()
{
    return new Combatant(this.URL, this.Name, this.HP, this.BaseInitiative, this.Initiative);
},

// Compares this combatant to the one passed in
CompareInitiative: function (a_cbOther)
{
    if (this.Initiative < a_cbOther.Initiative)
    {
        return -1;
    }
    else if (this.Initiative > a_cbOther.Initiative)
    {
        return 1;
    }
    else
    {
        if (this.BaseInitiative < a_cbOther.BaseInitiative)
        {
            return -1;
        }
        else if (this.BaseInitiative > a_cbOther.BaseInitiative)
        {
            return 1;
        }  
        else
        {
            return 0;
        }
    }
},

// Serializes the combatant
Serialize : function ()
{
    return {
        URL: this.URL,
        Name: this.Name,
        HP: this.HP,
        BaseInitiative: this.BaseInitiative,
        Initiative: this.Initiative,
        PageText: (this.URL ? null : this.Page.getValue(false)),
        NotesText: this.Notes.getValue(false)
    };
},

toString: function()
{  
    return "<table class='NoBorders' width='95%'>" +
        "<tr><td class='Left" + (this.HP <= 0 ? " Dead " : "") + "' style='width:100%'>" + this.Name + "</td>" + 
        "<td class='Right" + (this.HP <= 0 ? " HPDead " : "") + "'><div class='HPPadding' id='CombatantHP" + this.UniqueID + "' onmouseover='CombatantList.Instance.HighlightHP(" + this.UniqueID + ", true)' onmouseout='CombatantList.Instance.HighlightHP(" + this.UniqueID + ", false)' onmousedown='StopEvent(arguments[0])' onmouseup='StopEvent(arguments[0])' onclick='StopEvent(arguments[0]); CombatantList.Instance.OnClickHP(" + this.UniqueID + ")'>" + this.HP + "</div></td>" + 
        (!!_DEBUG_INITIATIVE ? ("<td class='Right'>Init: " + this.Initiative + "</td>") : "") +
        "</tr></table>";
}


});
