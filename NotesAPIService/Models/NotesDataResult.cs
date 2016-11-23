using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NotesAPIService.Models
{
    public class NotesDataResult
    {
        public NotesData notesdata = new NotesData();
        public string title { get; set; }
    }
}

