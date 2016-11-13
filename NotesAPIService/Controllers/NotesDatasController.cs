using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Description;
using NotesAPIService.Models;

namespace NotesAPIService.Controllers
{
    public class NotesDatasController : ApiController
    {
        private NotesAPIServiceContext db = new NotesAPIServiceContext();

        // GET: api/NotesDatas/test11@test.com
        public IQueryable<NotesData> GetNotesDatas(string userid)
        {

            if (userid == "") userid = "test11@test.com";
            IQueryable<NotesData> results = db.NotesDatas.Where(x => x.UserID == userid);
            
            return results;
        
        }

        // GET: api/NotesDatas
        public IQueryable<NotesData> GetNotesDatas()
        {
            return db.NotesDatas;
        }


        // GET: api/NotesDatas/test11@test.com/5
        [ResponseType(typeof(NotesData))]
        public IHttpActionResult GetNotesDataUser(string userid, string noteid)
        {
            List<NotesData> notesData = db.NotesDatas.Where(x => x.UserID == userid && x.GuidID == new Guid(noteid)).ToList();

            if (notesData == null)
            {
                return NotFound();
            }

            return Ok(notesData);
        }

        // GET: api/NotesDatas/5
        [ResponseType(typeof(NotesData))]
        public IHttpActionResult GetNotesData(string noteid)
        {
            NotesData notesData = db.NotesDatas.Find(noteid);
            if (notesData == null)
            {
                return NotFound();
            }

            return Ok(notesData);
        }

        // PUT: api/NotesDatas/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PutNotesData(string userid, NotesData notesData)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (userid != notesData.UserID)
            {
                return BadRequest();
            }

            db.Entry(notesData).State = EntityState.Modified;
            //HttpResponseMessage response;

            try
            {
                db.SaveChanges();

                //response = Request.CreateResponse<NotesData>(HttpStatusCode.Created, notesData);
                //response.Headers.Location = new Uri(Request.RequestUri, "/api/notesdatas/" + notesData.GuidID.ToString());
            }

            catch (DbUpdateConcurrencyException)
            {
                if (!NotesDataExists(userid))
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