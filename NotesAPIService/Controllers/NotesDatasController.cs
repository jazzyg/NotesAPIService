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


namespace NotesAPIService.Controllers
{
    
    
    public class NotesDatasController : ApiController
    {
        private NotesAPIServiceContext db = new NotesAPIServiceContext();

        // GET: api/NotesDatas/test11@test.com
        
        public IQueryable<NotesData> GetNotesDatas(string id)
        {

            if (id == "t") id = "test11@test.com";
            IQueryable<NotesData> results = db.NotesDatas.Where(x => x.UserID == id);
            
            return results;
        
        }

        // GET: api/NotesDatas
        //public IQueryable<NotesData> GetNotesDatas()
        //{
        //    return db.NotesDatas;
        //}

        // GET: api/NotesData/5
        [Route("api/NotesData/{id}", Name = "NotesData")]
        [HttpGet]
        [ResponseType(typeof(NotesData))]
        public IHttpActionResult NotesData(string id)
        {
            //NotesData notesData = db.NotesDatas.Find(id);
            NotesData notesData = db.NotesDatas.SingleOrDefault(m => m.GuidID == new Guid(id));
            
            if (notesData == null)
            {
                return NotFound();
            }

            return Ok(notesData);
        }

        // GET: api/NotesDatas/test11@test.com/5
        [ResponseType(typeof(NotesData))]
        public IHttpActionResult GetNotesDataUser(string id, string noteid)
        {
            NotesData notesData = db.NotesDatas.FirstOrDefault(x => x.UserID == id && x.GuidID == new Guid(noteid));

            if (notesData == null)
            {
                return NotFound();
            }

            return Ok(notesData);
        }



        // PUT: api/NotesDatas/5
        [ValidateHttpAntiForgeryToken]
        [ResponseType(typeof(void))]
        public IHttpActionResult PutNotesData(string id, NotesData notesData)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != notesData.UserID)
            {
                return BadRequest();
            }

            db.Entry(notesData).State = EntityState.Modified;
            
            try
            {
                db.SaveChanges();
            }

            catch (DbUpdateConcurrencyException)
            {
                if (!NotesDataExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Content(HttpStatusCode.Created, notesData);
        }

        // POST: api/NotesDatas
        [ValidateHttpAntiForgeryToken]
        [ResponseType(typeof(NotesData))]
        public IHttpActionResult PostNotesData(NotesData notesData)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.NotesDatas.Add(notesData);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateException)
            {
                if (NotesDataExists(notesData.UserID))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtRoute("DefaultApi", new { id = notesData.UserID }, notesData);
        }

        // DELETE: api/NotesDatas/5
        [ValidateHttpAntiForgeryToken]
        [ResponseType(typeof(NotesData))]
        public IHttpActionResult DeleteNotesData(string id)
        {
            NotesData notesData = db.NotesDatas.Find(id);
            if (notesData == null)
            {
                return NotFound();
            }

            db.NotesDatas.Remove(notesData);
            db.SaveChanges();

            return Ok(notesData);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool NotesDataExists(string id)
        {
            return db.NotesDatas.Count(e => e.UserID == id) > 0;
        }
    }
}