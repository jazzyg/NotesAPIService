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
using HtmlAgilityPack;
using System.IO;
using System.Collections.Generic;

namespace NotesAPIService.Controllers
{
    //simple repository class that stores items in a database, using Entity Framework.
    public class NotesDatasController : ApiController
    {
        private NotesAPIServiceContext db = new NotesAPIServiceContext();

        [Authorize]
        [Route("api/NotesDatas", Name = "NotesDatas")]
        [HttpGet]
        [ResponseType(typeof(string))]
        public string GetNotesDatas()
        {
            var userName = this.RequestContext.Principal.Identity.Name;
            return String.Format("Hello, {0}.", userName);
        }

        // GET: api/NotesDatas/test11@test.com       
        //public IQueryable<NotesData> GetNotesDatas(string id)
        //{
        //    IQueryable<NotesData> results = db.NotesDatas.Where(x => x.UserID == id);
        //    return results;
        //}
        public List<NotesData> GetNotesDatas(string id)
        {
            try
            {
                List<NotesData> list = db.NotesDatas.Where(x => x.UserID == id).ToList();

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
                NotesData notesData = db.NotesDatas.SingleOrDefault(m => m.GuidID == new Guid(noteid));
               
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
        }

        //[Route("api/NoteLastModified/{noteid}", Name = "NoteLastModified")]
        //[HttpGet]
        //[ResponseType(typeof(NotesData))]
        //public IHttpActionResult NoteLastModified(string noteid)
        //{
        //    //NotesData notesData = db.NotesDatas.Find(id); //find search only one key
        //    try
        //    {
        //        NotesData notesData = db.NotesDatas.SingleOrDefault(m => m.GuidID == new Guid(noteid));

        //        if (notesData == null)
        //        {
        //            return NotFound();
        //        }

        //        return Ok(notesData.UpdateDate);
        //    }
        //    catch (InvalidOperationException)
        //    {
        //        return BadRequest("Multiple Record found for note id:" + noteid);
        //    }
        //}

        //// GET: api/NotesDatas/test11@test.com/55555-5555
        //[Route("api/NotesData/{id}/{noteid}", Name = "GetNotesDataUser")]
        //[ResponseType(typeof(NotesData))]
        //public IHttpActionResult GetNotesDataUser(string id, string noteid)
        //{
        //    NotesData notesData = db.NotesDatas.FirstOrDefault(x => x.UserID == id && x.GuidID == new Guid(noteid));

        //    if (notesData == null)
        //    {
        //        return NotFound();
        //    }

        //    return Ok(notesData);
        //}

        // PUT - modify existing note. Only note data can be modified.
        // PUT: api/NotesDatas/5
        // [ValidateHttpAntiForgeryToken]
        
        [ResponseType(typeof(void))]
        public IHttpActionResult PutNotesData(string id, NotesData notesData)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if ((notesData.GuidID == null || notesData.GuidID == new Guid()))
            {
                return BadRequest("Invalid notes key values");
            }

            Guid guidOutput;
            if (Guid.TryParse(notesData.GuidID.ToString(), out guidOutput) == true)
            {
                notesData.UpdateDate = DateTime.Now;
                db.Entry(notesData).State = EntityState.Modified;
            }
            else
            {
                return BadRequest("Invalid Note key");
            }

            try
            {
                db.SaveChanges();
            }

            catch (DbUpdateConcurrencyException)
            {
                if (!NotesDataExists(id, notesData.GuidID))
                {
                    return NotFound();
                }
                else
                {
                    return BadRequest("Error in updating notes"); 
                }
            }
           
            return Content(HttpStatusCode.Created, notesData);
        }

        //Post - Create new note
        // POST: api/NotesDatas
        //   [ValidateHttpAntiForgeryToken]

        [Route("api/NotesDatas")]
        [ResponseType(typeof(NotesData))]
        public IHttpActionResult PostNotesData(NotesData notesData)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            //We are creating new note for userid. so no mote data should be provided. 
            if (string.IsNullOrEmpty(notesData.UserID))
            {
                return BadRequest("Invalid key values");
            }

            //if (!NotesDataExists(notesData.UserID))
            //{
            //    return BadRequest("User doesn't exists");
            //}

            if (notesData.GuidID == new Guid()) notesData.GuidID = Guid.NewGuid();
            notesData.UpdateDate = DateTime.Now;
            notesData.Createdate = DateTime.Now;

            db.NotesDatas.Add(notesData);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateException)
            {
                if (NotesDataExists(notesData.UserID, notesData.GuidID))
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

        // DELETE: api/NotesDatas/userid/guid
        // [ValidateHttpAntiForgeryToken]
        [Route("api/NotesDatas/{id}/{noteid}")]
        [ResponseType(typeof(NotesData))]
        public IHttpActionResult DeleteNotesData(string id, string noteid)
        {
            NotesData notesData;
            //notesData = db.NotesDatas.Find(id, new Guid(noteid));
            try
            {
                Guid noteguid = new Guid(noteid);

                if (!NotesDataExists(id, noteguid))
                {
                    return NotFound();
                }

                notesData = db.NotesDatas.Single(m => m.UserID == id && m.GuidID == noteguid);

                db.NotesDatas.Remove(notesData);
                db.SaveChanges();

                return Ok(notesData);

            }
            catch (InvalidOperationException)
            {
                return BadRequest("Multiple Record found for note id:" + noteid);
            }
       }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }

            base.Dispose(disposing);
        }

        private bool NotesDataExists(string id, Guid noteid )
        {
            return db.NotesDatas.Count(e => e.UserID == id && e.GuidID == noteid) > 0;
        }
        private bool NotesDataExists(string id, string noteid)
        {
            return db.NotesDatas.Count(e => e.UserID == id && e.GuidID == new Guid(noteid)) > 0;
        }
        private bool NotesDataExists(string id)
        {
            return db.NotesDatas.Count(e => e.UserID == id) > 0;
        }
    }

    
}