using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;

namespace NotesAPIService.Models
{
    public interface INotesRepository: IDisposable
    {
        List<NotesData> GetNotesDatas(string userid);
        NotesData GetNotesData(Guid noteid);
        NotesData PutNotesData(string id, NotesData notesData);
        NotesData PostNotesData(NotesData notesData);
        NotesData DeleteNotesData(string id, string noteid);
       
    }
}
