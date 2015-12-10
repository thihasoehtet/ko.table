(function (window, $, ko) {
    function KoTable(args) {
        var self = this;
        self.serverApi = args.serverApi || null;
        self.payload = args.payload || {};
        self.index = ko.observable(1);
        self.size = ko.observable(args.pageSize || 10);
        self.data = ko.mapping.fromJS([]);
        self.recordsTotal = ko.observable(0);
        self.pageSlide = ko.observable(args.pageSlide || 5);        
        self.sortValue = args.sortValue || function () { return {} };
        self.beforePaging = args.beforePaging || function (targetIndex, koTableObj) { };
        self.afterPaging = args.afterPaging || function (data, koTableObj) { };
        self.goToPage = function (targetIndex) {
            self.beforePaging(targetIndex, self);
            if (targetIndex < 1 || targetIndex > self.pagesTotal()) {
                return;
            }
            self.payload.Skip = (targetIndex - 1) * self.size();
            self.payload.Take = self.size();
            $.getJSON(self.serverApi, self.payload, function (data) {
                self.afterPaging(data, self);
                ko.mapping.fromJS(data.TablePagedData, self.data);
                self.recordsTotal(data.TableTotalCount);
                self.index(targetIndex);
            });
        };
        self.goToFirstPage = function () {
            self.goToPage(1);
        };
        self.goToLastPage = function () {
            self.goToPage(self.pagesTotal());
        };
        self.onNext = function () {
            self.goToPage(self.index() + 1);
        };
        self.onPrev = function () {
            self.goToPage(self.index() - 1);
        };
        self.pagesTotal = ko.computed(function () {
            if (self.size() < 1) {
                return 1;
            }
            var pagesTotal = Math.ceil(self.recordsTotal() / self.size());
            if (pagesTotal < 1) {
                return 1;
            }
            return pagesTotal;
        });
        self.hasNext = ko.computed(function () {
            return self.index() < self.pagesTotal();
        });
        self.hasPrev = ko.computed(function () {
            return self.index() > 1;
        });
        self.isAtFirstPage = ko.computed(function () {
            return self.index() == 1;
        });
        self.isAtLastPage = ko.computed(function () {
            return self.index() == self.pagesTotal();
        });
        self.init = function () {
            self.goToPage(1);
        };
        self.hasData = ko.computed(function () {
            return self.data().length > 0;
        });        
        self.pages = ko.computed(function () {
            var pageFrom = Math.max(1, self.index() - self.pageSlide());
            var pageTo = Math.min(self.pagesTotal(), self.index() + self.pageSlide());
            var result = [];
            for (var i = pageFrom; i <= pageTo; i++) {
                result.push(new PagerItem(i, self.index(), self.goToPage));
            }
            return result;
        });
        self.formSubmit = function (formElement) {
            self.serverApi = $(formElement).prop('action') || self.serverApi;
            self.payload = $(formElement).serializeArray().reduce(function (obj, item) {
                obj[item.name] = item.value;
                return obj;
            }, {});
            $(formElement).find('input[type=checkbox]:checked').each(function (index, dom) {
                self.payload[this.name] = true;
            });
            self.init();
        };
    };

    function PagerItem(pageNumber, index, goToPage) {
        var self = this;
        self.pageNumber = pageNumber;        
        self.isActivePage = (pageNumber == index);
        self.goToThisPage = function () {
            goToPage(self.pageNumber);
        };
    }

    ko.table = ko.table || function (args) {
        return new KoTable(args);
    };
})(window, jQuery, ko);
