using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using HtmlAgilityPack;
using System.IO;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;

namespace NotesAPIService.Models
{
    public class NotesRepository : INotesRepository
    {

        private NotesAPIServiceContext db;

        public NotesRepository(NotesAPIServiceContext db)
        {
            this.db = db;
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
                throw;
            }
        }


        public NotesData GetNotesData(Guid noteid)
        {
            //NotesData notesData = db.NotesDatas.Find(id); //find search only one key
            try
            {
                NotesData notesData = db.NotesDatas.SingleOrDefault(m => m.GuidID == noteid);

                return notesData;
            }
            catch
            {
                throw;
            }
        }

        public NotesData PutNotesData(string id, NotesData notesData)
        {

            if ((notesData.GuidID == null || notesData.GuidID == new Guid()))
            {
                throw new InvalidDataException("Invalid notes key values");
            }

            Guid guidOutput;
            if (Guid.TryParse(notesData.GuidID.ToString(), out guidOutput) == true)
            {
                //Check if latest Notes exists prior to updating the version
                //NotesData note = VerifyNotesTimestamp(notesData.GuidID);

                //if (note.UpdateDate > notesData.UpdateDate || notesData.UpdateDate == null)
                //{
                //    return BadRequest("update date mismatch");
                //}
                notesData.UpdateDate = DateTime.Now;
                db.Entry(notesData).State = EntityState.Modified;

            }
            else
            {
                throw new InvalidDataException("Invalid Note key");
            }

            try
            {
                db.SaveChanges();
            }

            catch (DbUpdateConcurrencyException)
            {
                if (!NotesDataExists(id, notesData.GuidID))
                {
                    throw new KeyNotFoundException("Invalid Note key");
                }
                else
                {
                    throw new DbUpdateException("Error in updating notes");
                }
            }

            catch (Exception)
            {
                throw new Exception("Error in operation");
            }

            return notesData;
        }

        public NotesData PostNotesData(NotesData notesData)
        {


            //We are creating new note for userid. so no mote data should be provided. 
            if (string.IsNullOrEmpty(notesData.UserID))
            {
                throw new KeyNotFoundException("Invalid key values");
            }

            if (notesData.GuidID == new Guid()) notesData.GuidID = Guid.NewGuid();
            notesData.UpdateDate = DateTime.Now;
            notesData.Createdate = DateTime.Now;

            db.NotesDatas.Add(notesData);

            try
            {
                db.SaveChanges();
            }
            catch (Exception)
            {
                if (NotesDataExists(notesData.UserID, notesData.GuidID))
                {
                    throw new DbUpdateException("Note already exists");
                }
                else
                {
                    throw;
                }
            }

            return notesData;

        }


        public NotesData DeleteNotesData(string id, string noteid)
        {
            NotesData notesData;
            //notesData = db.NotesDatas.Find(id, new Guid(noteid));
            try
            {
                Guid noteguid = new Guid(noteid);

                if (!NotesDataExists(id, noteguid))
                {
                    throw new KeyNotFoundException("Note Not found");
                }

                notesData = db.NotesDatas.Single(m => m.UserID == id && m.GuidID == noteguid);

                db.NotesDatas.Remove(notesData);
                db.SaveChanges();

                return notesData;

            }
            catch (InvalidOperationException)
            {
                throw new InvalidDataException("Multiple Record found for note id:" + noteid);
            }
        }

        private bool disposed = false;

        protected virtual void Dispose(bool disposing)
        {
            if (!this.disposed)
            {
                if (disposing)
                {
                    db.Dispose();
                }
            }
            this.disposed = true;
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }


        private bool NotesDataExists(string id, Guid noteid)
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
        private NotesData VerifyNotesTimestamp(Guid noteid)
        {
            return db.NotesDatas.SingleOrDefault(m => m.GuidID == noteid);
        }
    }
}