////////////////////////////////////////////////////////////////////////////////
//
//  UNKNOWN
//
//  Copyright (c) 2009 Jon Thompson
//
////////////////////////////////////////////////////////////////////////////////
//
/// \file Parsing.js
/// \brief Classes and functions for parsing a creature page
/// \author Jon Thompson
/// \created February 11, 2009
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



// Loads a particular page and gets its HTML
function GetPageHTML (a_sURL, a_fnCallback)
{
    dojo.xhrGet(
    {
        url: "RemotePage.php?URL=" + escape(a_sURL),        
        handleAs: "text",
        
        load: function(response, ioArgs) 
        {        
            // If the response is blank then that means that the remote page
            // didn't exist, even though the local page did
            if (!response)
            {
                // Call the callback with failure
                a_fnCallback(false, null);                
            }
            else
            {        
                // Call the callback with success
                a_fnCallback(true, response);
            }
            
            // Return the response object
            return response;
        },
        
        error: function(response, ioArgs)
        {
            // Call the callback with failure
            a_fnCallback(false, null);
            return response;
        }
    });
}




// Class for parsing a page looking for certain things
dojo.declare("PageParser", null,
{

// General constructor for a prompt
// Criteria must be an object of this form
// {
//      FirstValueToRead: [/Regexp to look for first/, /Regexp to look for second/, ...]
//      SecondValueToRead: [/Regexp to look for first/, /Regexp to look for second/, ...]
//      ...
// }
// 
// Each regexp must contain a set of capturing parenthesis which will be used to get the value
constructor: function(a_hCriteria)
{
    this.m_hCriteria = a_hCriteria;
},

// Parses a page's HTML and calls the callback when done
// The object passed into the callback is of the following form
// {
//      FirstValueToRead: (value read or null on failure)
//      SecondValueToRead: (value read or null on failure)
// }
// If the whole read fails the function returns null
ParsePage : function (a_sURL, a_fnCallback)
{
    var oPageParser = this;
    
    GetPageHTML(a_sURL, function(a_bSuccess, a_sHTML)
    {
        if (a_bSuccess)
        {
            a_fnCallback (oPageParser.ParseHTML(a_sHTML));
        }
        else
        {
            a_fnCallback (null);
        }
    });
},

// Parses HTML
// See parse page for details
ParseHTML : function (a_sHTML)
{
    // Create a blank result object
    var oResult = {};

    // Loop through all the values
    for (var sValue in this.m_hCriteria)
    {
        var aRegexps = this.m_hCriteria[sValue];
        for (var iRX = 0; iRX < aRegexps.length; ++iRX)
        {
            // Try to match to the regular expression 
            var mMatch = aRegexps[iRX].exec(a_sHTML);
            
            // Check if a match was found
            if (mMatch != null && mMatch.length > 1)
            {
                // Grab the first capturing parenthesis
                oResult[sValue] = mMatch[1];
                
                // We found a result, so there is no need to continue
                break;
            }
        }
    }        
    
    // Return the resultant object
    
    return oResult;
},

m_hCriteria: null

});


// Specific parsers

var MonsterParser = new PageParser (
{
    Name:
    [
        /\<span class="xp"\>\s*XP\s*[0-9]+\<\/span\>\<\/span\>\s*([\w\d\s,\(\)]+)\</     ,   // 4e Compendium
        /\<title\>([\w\d\s,\(\)]+)\s*\:\:\s*d20srd\.org\<\/title\>/                          // d20 SRD
    ],

    HP: 
    [
        /\<b\>HP\<\/b\>\s*(\d+)/                                                    ,   // 4e Compendium
        /HP\s*(\d+)/                                                                ,   // 4e Compendium, plain text 
        /(\d+) hp/                                                                      // d20 SRD
    ],
    
    Initiative:
    [
        /\<b\>Initiative\<\/b\>\s*([\+\-]*\d+)/                                     ,   // 4e Compendium
        /Initiative\s*([\+\-]*\d+)/                                                 ,   // 4e Compendiuk, plain text
        /Initiative\<\/a\>\:\<\/th\>\s*\<td\>\<a[^\>]*>([\+\-]*\d+)\<\/a\>\<\/td\>/     // d20 SRD

    ]
});



