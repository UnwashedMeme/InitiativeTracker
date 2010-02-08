////////////////////////////////////////////////////////////////////////////////
//
//  Utility Functions
//
//  Copyright (c) 2009 Jon Thompson
//
////////////////////////////////////////////////////////////////////////////////
//
/// \file Util.js
/// \brief Misc utility functions
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

String.prototype.isAlpha = function()
{
	return (this>='a'&&this<='z\uffff')||(this>='A'&&this<='Z\uffff');
};

String.prototype.isDigit = function()
{
	return (this >= '0' && this <= '9');
};

String.prototype.isAlphaNum = function()
{
	return this.isAlpha() || this.isDigit();
};

String.prototype.trim = function()
{
	var s = this;

	// Remove leading spaces and carriage returns
	while ((s.substring(0,1) == ' ') || (s.substring(0,1) == '\n') || (s.substring(0,1) == '\r'))
	{ s = s.substring(1,s.length); }

	// Remove trailing spaces and carriage returns
	while ((s.substring(s.length-1,s.length) == ' ') || (s.substring(s.length-1,s.length) == '\n') || (s.substring(s.length-1,s.length) == '\r'))
	{ s = s.substring(0,s.length-1); }

	return s;
};

//Replace all instances of one string with another
String.prototype.replaceAll = function( a_sOld, a_sNew )
{
	var sReturn = this;
	
	while( sReturn.indexOf( a_sOld ) != -1 )
	{
		sReturn = sReturn.replace( a_sOld, a_sNew );
	}
	
	return sReturn.toString();
};


// Parses an int, always base 10, and returning 0 on bad int (instead of NaN)
function SafeParseInt(a_sString)
{
    var nResult = parseInt(a_sString, 10);
    if (isNaN (nResult))
    {
        return 0;
    }
    
    return nResult;
}

// Gets a unique ID
function GetUniqueID()
{
    return ++g_nNextUniqueID;
}
var g_nNextUniqueID = 0;

// Delays an action
function Delay(a_fn)
{
    setTimeout(a_fn, 50);
}

// Shows or hides all elements in a list
function ShowElements (a_lstElements, a_bShow)
{
    for (var iEl = 0; iEl < a_lstElements.length; ++iEl)
    {
        a_lstElements[iEl].style.display = a_bShow ? "" : "none";
    }
}

// Deletes all child nodes of an HTML DOM node
function DeleteAllChildNodes(a_ndParent)
{
    if (a_ndParent.hasChildNodes())
    {
        while (a_ndParent.childNodes.length >= 1)
        {
            a_ndParent.removeChild(a_ndParent.firstChild);       
        } 
    }
}    


// Stops an event from propagating
function StopEvent(a_eEvent) 
{
    var eEvent = a_eEvent || window.event;
    if (eEvent.stopPropagation) 
    {
        eEvent.stopPropagation();
    }
    else
    {       
        eEvent.cancelBubble = true;
    }
}

// Randomness
function Uniform( nMin, nMax ){ return Math.floor( Math.random() * ( nMax - nMin + 1 ) ) + nMin; }
function Die( a_nFaces ){ return Uniform( 1, a_nFaces ); }

function d2(){ return Die( 2 ); }
function d3(){ return Die( 3 ); }
function d4(){ return Die( 4 ); }
function d6(){ return Die( 6 ); }
function d8(){ return Die( 8 ); }
function d10(){ return Die( 10 ); }
function d12(){ return Die( 12 ); }
function d20(){ return Die( 20 ); }
function d100(){ return Die( 100 ); }

function Dice( a_nNum, a_nFaces )
{ 
	var nTotal = 0;

	for( var i = 0; i < a_nNum; i += 1 ) 
	{
		nTotal += Die( a_nFaces );
	} 

	return nTotal;
} // Dice



// Validates a display name and displays a popup if it fails
function ValidateDisplayNameWithPopup(a_sKey)
{
    if (!ValidateDisplayName(a_sKey))
    {
        alert("\"" + a_sKey + "\" is not a valid saved name.  " +
            "Names must be 1 to 50 characters long and can only " +
            "contain letters, numbers, and spaces.");
        return false;
    }
    return true;
}

// Validates a display name
function ValidateDisplayName(a_sKey)
{
    a_sKey = a_sKey.trim();

    // If the key is null or empty string, it fails
    if (!a_sKey)
    {
        return false;
    }
    
    // Impose an arbitrary limit of 50 chars, in case some storage provider
    // does have some limit    
    if (a_sKey.length > 50)
    {
        return false;
    }
    
    
    // Make sure all characters are alphanum + space
    if (!a_sKey.match(/^[a-zA-Z0-9 ]+$/))
    {
        return false;
    }
    
    // Validation passed
    return true;
}

// Converts a display name to storage key
function DisplayNameToStorageKey (a_sUser)
{
    return a_sUser.trim().replaceAll(" ", "_");
}

// Converts a key to a display name
function StorageKeyToDisplayName (a_sKey)
{
    return a_sKey.replaceAll("_", " ");
}




// Toolbar newline

dojo.subscribe(dijit._scopeName+".Editor.getPlugin",null,
function(o)
{
    if(o.plugin)
    {
        return;
    }
    
    switch(o.args.name)
    {
    case "-":
        o.plugin = new dijit._editor._Plugin({button:new ToolbarNewline()});
    }
});

dojo.declare("ToolbarNewline",  [dijit._Widget,dijit._Templated], 
{
templateString:"<br>",

postCreate: function()
{
    dojo.setSelectable(this.domNode,false);
},

isFocusable: function()
{
    return false;
}
});


// Editor Toolbar
var TOOLBAR_PLUGINS =
[            
    {name:"dijit._editor.plugins.FontChoice", command:"fontName", generic:true},
    "fontSize",
    "-",
    "bold", 
    "italic", 
    "underline", 
    "strikethrough", 
    "subscript", 
    "superscript", 
    "removeFormat", 
    "|",
    "foreColor", 
    "hiliteColor",
    "|",
    "indent", 
    "outdent",
    "|",
    "justifyLeft", 
    "justifyCenter", 
    "justifyRight",
    "justifyFull", 
    "|",
    "insertOrderedList", 
    "insertUnorderedList",
    "|",
    "undo", 
    "redo"
];


