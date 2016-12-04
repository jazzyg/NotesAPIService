using System;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Web.Http;
using System.Web.Http.Description;
using NotesAPIService.Models;
using NotesAPIService.Filters;
using System.Collections.Generic;
using System.IO;

namespace NotesAPIService.Controllers
{
    //simple repository class that stores items in a database, using Entity Framework.
    [Authorize]
    public class NotesDatasController : ApiController
    {
        //private NotesAPIServiceContext db = new NotesAPIServiceContext();

        private INotesRepository notesRepository;

        public NotesDatasController()
        {
            this.notesRepository = new NotesRepository(new NotesAPIServiceContext());
        }

        public  NotesDatasController(INotesRepository notesRepository)
        {
            this.notesRepository = notesRepository;
        }

        [Route("api/NotesDatas", Name = "NotesDatas")]
        [HttpGet]
        [ResponseType(typeof(string))]
        public string GetNotesDatas()
        {
            var userName = this.RequestContext.Principal.Identity.Name;
            return String.Format("Hello, {0}.", userName);
        }

       
        public List<NotesData> GetNotesDatas(string id)
        {
            try
            {
                List<NotesData> list = notesRepository.GetNotesDatas(id);

                return list;
            }
            catch
            {
                return (new List<NotesData>());
            }
        }

        // GET: api/NotesData/5555-55555
        [Route("api/NotesData/{noteid}", Name = "NotesData")]
        [HttpGet]
        [ResponseType(typeof(NotesData))]
        public IHttpActionResult GetNotesData(string noteid)
        {
            //NotesData notesData = db.NotesDatas.Find(id); //find search only one key
            try
            {
                NotesData notesData = notesRepository.GetNotesData(new Guid(noteid));

                if (notesData == null)
                {
                    return NotFound();
                }

                return Ok(notesData);
            }
            catch (InvalidOperationException)
            {
                return BadRequest("Multiple Record found for note id:" + noteid);
            }
            catch (Exception)
            {
                return BadRequest("Not able to get data for: " + noteid);
            }
        }

        // PUT - modify existing note. Only note data can be modified.
        // PUT: api/NotesDatas/5
        [ValidateHttpAntiForgeryToken]

        [ResponseType(typeof(void))]
        public IHttpActionResult PutNotesData(string id, NotesData notesData)
        {
            NotesData retnotesData;
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                retnotesData = notesRepository.PutNotesData(id, notesData);
                
            }

            catch (KeyNotFoundException)
            {

                return NotFound();

            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

            return Content(HttpStatusCode.Created, retnotesData);
        }

        //Post - Create new note
        // POST: api/NotesDatas
        [ValidateHttpAntiForgeryToken]

        [Route("api/NotesDatas")]
        [ResponseType(typeof(NotesData))]
        //We are creating new note for userid. so no more data should be provided. 
        public IHttpActionResult PostNotesData(NotesData notesData)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            NotesData retnotesData;
            try
            {


                retnotesData = notesRepository.PostNotesData(notesData);

            }
            catch (KeyNotFoundException) { return BadRequest("Invalid key values"); }
            catch (DbUpdateException dux)
            {
                // return Conflict();
                return BadRequest("Conflict in addition: " + dux.Message);
            }
            catch (Exception e) { return BadRequest("error in addition: " + e.Message); }


            return Content(HttpStatusCode.Created, retnotesData);
            //CreatedAtRoute("DefaultApi", new { id = notesData.UserID }, notesData);
        }

        // DELETE: api/NotesDatas/userid/guid
        [ValidateHttpAntiForgeryToken]
        [Route("api/NotesDatas/{id}/{noteid}")]
        [ResponseType(typeof(NotesData))]
        public IHttpActionResult DeleteNotesData(string id, string noteid)
        {
            NotesData retnotesData;
            
            try
            {
                Guid noteguid = new Guid(noteid);

                
                retnotesData = notesRepository.DeleteNotesData(id, noteid);
                
                return Ok(retnotesData);

            }
            catch(KeyNotFoundException) { return BadRequest("Note not found:"); }
            catch (InvalidOperationException)
            {
                return BadRequest("Multiple Record found for note id:" + noteid);
            }
            catch(Exception e) { return BadRequest("Error in deletion:" + e.Message); }
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                notesRepository.Dispose();
            }

            base.Dispose(disposing);
        }
        
        public new void Dispose()
        {
            base.Dispose();
            
        }
    }
}