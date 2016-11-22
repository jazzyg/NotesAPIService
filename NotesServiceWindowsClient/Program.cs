using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NotesServiceWindowsClient
{

    public class NotesData
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
    }

    class Program
    {

        static HttpClient client = new HttpClient();
        static void Main()
        {
            RunAsync().Wait();
        }
        static void ShowNotesData(NotesData notesData)
        {
            Console.WriteLine($"ID: {notesData.UserID}\tNoteid: {notesData.GuidID}\tNotes: {notesData.Notes}");
        }

        static async Task<Uri> CreateNotesDataAsync(NotesData notesData)
        {
            HttpResponseMessage response = await client.PostAsJsonAsync("api/notesData", notesData);
            response.EnsureSuccessStatusCode();

            // return URI of the created resource.
            return response.Headers.Location;
        }

        static async Task<NotesData> GetNotesDataAsync(string path)
        {
            NotesData notesData = null;
            HttpResponseMessage response = await client.GetAsync($"api/notesDatas/{notesData.UserID}");
           // HttpResponseMessage response = await client.GetAsync(path);
            if (response.IsSuccessStatusCode)
            {
                notesData = await response.Content.ReadAsAsync<NotesData>();
            }
            return notesData;
        }

        static async Task<NotesData> GetSingNotesDataAsync(string path)
        {
            NotesData notesData = null;
            HttpResponseMessage response = await client.GetAsync($"api/notesData/{notesData.GuidID}");
            // HttpResponseMessage response = await client.GetAsync(path);
            if (response.IsSuccessStatusCode)
            {
                notesData = await response.Content.ReadAsAsync<NotesData>();
            }
            return notesData;
        }
        static async Task<NotesData> UpdateNotesDataAsync(NotesData notesData)
        {
            HttpResponseMessage response = await client.PutAsJsonAsync($"api/notesData/{notesData.UserID}", notesData);
            response.EnsureSuccessStatusCode();

            // Deserialize the updated notesData from the response body.
            notesData = await response.Content.ReadAsAsync<NotesData>();
            return notesData;
        }

        static async Task<HttpStatusCode> DeleteNotesDataAsync(string id, string noteid)
        {
            HttpResponseMessage response = await client.DeleteAsync($"api/notesData/{id}/{noteid}");
            return response.StatusCode;
        }



        static async Task RunAsync()
        {
            client.BaseAddress = new Uri("https://notesapiservice.azurewebsites.net/");
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            try
            {
                // Create a new notesData
                NotesData notesData = new NotesData { UserID = "Test11@test.com", Notes = "" };

                var url = await CreateNotesDataAsync(notesData);
                Console.WriteLine($"Created at {url}");

                // Get the notesData
                notesData = await GetNotesDataAsync(url.PathAndQuery);
                ShowNotesData(notesData);

                // Update the notesData
                Console.WriteLine("Updating notes...");
                notesData.Notes = "Updated note from windows client";
                await UpdateNotesDataAsync(notesData);

                // Get the updated notesData
                notesData = await GetNotesDataAsync(url.PathAndQuery);
                ShowNotesData(notesData);

                // Delete the notesData
                var statusCode = await DeleteNotesDataAsync(notesData.UserID, notesData.GuidID.ToString());
                Console.WriteLine($"Deleted (HTTP Status = {(int)statusCode})");

            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message);
            }

            Console.ReadLine();
        }
    }
}


