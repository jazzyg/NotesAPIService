using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NotesAPIService.Models
{
    public class NotesData : NotesRepository
    {
        [Key]
        [Column(Order = 0)]
        public string UserID { get; set; }
        [Key]
        [Column(Order = 1)]
        public System.Guid GuidID { get; set; }
        public string Notes { get; set; }
        public Nullable<System.DateTime> Createdate { get; set; }
        public Nullable<System.DateTime> UpdateDate { get; set; }

        [NotMapped]
        public string Title
        {
            get
            {
                if (this.Notes.Length > 0)
                { return (new HtmlToText()).Convertchars(this.Notes, 20) + "..."; }
                else { return "No Title..."; }
            }
        }
        [NotMapped]
        public Int32 syncstatus { get { return 0; } }



    }

}

