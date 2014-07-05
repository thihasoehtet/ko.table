ko.table
========

Table for Knockout.
I want simple. So, I follow simple. And I want to build simple.

***
References: 
* [knockout.pager](https://github.com/nathanrobinson/knockout.pager)
* [knockout-table](https://github.com/mbest/knockout-table)

**Script**
```
<script src="~/Scripts/knockout-3.1.0.js"></script>
<script src="~/Scripts/ko.table.js"></script>
<script>
    // Page View Setup
    var ajaxUrl = $("#hidPostUrl").val();
    var pageSize = 2;
    var payload = { name: ko.observable("") };
    var sortValue = { key: ko.observable("Age"), direction: ko.observable("asc") };

    function ViewModel(table) {
        var self = this;
        self.table = ko.table(ajaxUrl, pageSize, payload, sortValue);
    };

    ko.applyBindings(new ViewModel());
</script>
```

**Html**
```

<label>Name</label>
<input type="text" data-bind="value: table.payload.name" />
<button data-bind="click: table.init">Search</button>
<label>Sort by Age</label>
<select data-bind="options: ['asc','desc'], value: table.sortValue.direction"></select>
<button data-bind="click: table.init">Sort</button>
<hr />
<table>
    <thead>
        <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Position</th>
            <th>Office</th>
            <th>Age</th>
            <th>StartDate</th>
        </tr>
    </thead>
    <tbody data-bind="foreach: table.data">
        <tr>
            <td data-bind="text: Id"></td>
            <td data-bind="text: Name"></td>
            <td data-bind="text: Position"></td>
            <td data-bind="text: Office"></td>
            <td data-bind="text: Age"></td>
            <td data-bind="text: StartDate"></td>
        </tr>
    </tbody>
</table>
<hr />
<button data-bind="click: table.onPrev, enable: table.hasPrev">Prev</button>
<button data-bind="click: table.onNext, enable: table.hasNext">Next</button>

Page: <span data-bind="text: table.index"></span> of <span data-bind="text: table.pagesTotal"></span> |
Total Records: <span data-bind="text: table.recordsTotal"></span>

@Html.Hidden("hidPostUrl", Url.Action("ServerSidePaging"))
```

**Server-Side (C# Asp.net Mvc)**
```

using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;

namespace Ko.Table.Controllers
{
    public class HomeController : Controller
    {
        // GET: Home
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public JsonResult ServerSidePaging(KoTable koTable)
        {
            var q = GetRecords();

            if (!string.IsNullOrWhiteSpace(koTable.Payload.Name))
            {
                q = q.Where(d => d.Name.ToLower().Contains(koTable.Payload.Name.ToLower()));
            }

            if (koTable.SortValue.Direction == "asc")
            {
                q = q.OrderBy(d => d.Age);
            }
            else
            {
                q = q.OrderByDescending(d => d.Age);
            }

            int recordsTotal = q.Count();
            var data = q.Skip(koTable.Start).Take(koTable.Length).ToList();

            return Json(new { data, recordsTotal });
        }

        private IEnumerable<Record> GetRecords()
        {
            yield return new Record() { Id = 1, Name = "Airi Satou", Position = "Accountant", Office = "Tokyo", Age = 33, StartDate = new DateTimeOffset(2008, 11, 28, 0, 0, 0, TimeSpan.Zero) };
            yield return new Record() { Id = 2, Name = "Bradley Greer", Position = "Software Engineer", Office = "London", Age = 41, StartDate = new DateTimeOffset(2012, 10, 13, 0, 0, 0, TimeSpan.Zero) };
            yield return new Record() { Id = 3, Name = "Ajj Bu", Position = "GM", Office = "London", Age = 50, StartDate = new DateTimeOffset(2012, 10, 13, 0, 0, 0, TimeSpan.Zero) };
        }
    }

    public class Record
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Position { get; set; }
        public string Office { get; set; }
        public int Age { get; set; }
        public DateTimeOffset StartDate { get; set; }
        public decimal Salary { get; set; }
    }

    public class Payload
    {
        public string Name { get; set; }
    }

    public class SortValue
    {
        public string Key { get; set; }
        public string Direction { get; set; }
    }

    public class KoTable
    {
        public int Start { get; set; }
        public int Length { get; set; }
        public Payload Payload { get; set; }
        public SortValue SortValue { get; set; }
    }
}
```
