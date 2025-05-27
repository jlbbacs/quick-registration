import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Registrant } from '../types';
import { 
  getAllRegistrants, 
  deleteRegistrant 
} from '../services/registrationService';
import { 
  Edit, 
  Trash2, 
  UserCog, 
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


export const AdminDashboard: React.FC = () => {
  const [registrants, setRegistrants] = useState<Registrant[]>([]);
  const [filteredRegistrants, setFilteredRegistrants] = useState<Registrant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  useEffect(() => {
    loadRegistrants();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredRegistrants(registrants);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = registrants.filter(
        (registrant) =>
          registrant.fullName.toLowerCase().includes(lowercasedSearch) ||
          registrant.email.toLowerCase().includes(lowercasedSearch) ||
          registrant.phone.includes(searchTerm)
      );
      setFilteredRegistrants(filtered);
    }
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchTerm, registrants]);

  const loadRegistrants = () => {
    setIsLoading(true);
    try {
      const data = getAllRegistrants();
      setRegistrants(data);
      setFilteredRegistrants(data);
    } catch (error) {
      console.error('Error loading registrants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      deleteRegistrant(id);
      loadRegistrants();
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };
 const exportToPDF = () => {
  const doc = new jsPDF();
  doc.text('Registrant List', 14, 15);

  const tableColumn = ['Photo', 'Name', 'Email', 'Phone', 'Gender', 'DOB'];
  const tableRows: any[] = [];

  const imagePromises = filteredRegistrants.map((r) =>
    new Promise<{ img: string; registrant: typeof r }>((resolve) => {
      if (r.photoData) {
        const img = r.photoData;
        resolve({ img, registrant: r });
      } else {
        resolve({ img: '', registrant: r }); // No image
      }
    })
  );

  Promise.all(imagePromises).then((results) => {
    results.forEach(({ img, registrant }) => {
      tableRows.push([
        { content: '', img }, // Cell with image
        registrant.fullName,
        registrant.email,
        registrant.phone,
        registrant.gender,
        formatDate(registrant.dateOfBirth),
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      didDrawCell: (data) => {
        if (data.column.index === 0 && data.cell.raw?.img) {
          const img = data.cell.raw.img;
          const dim = 10; // Size of the image
          const xPos = data.cell.x + 1;
          const yPos = data.cell.y + 1;
          try {
            doc.addImage(img, 'JPEG', xPos, yPos, dim, dim);
          } catch (error) {
            console.warn('Failed to add image', error);
          }
        }
      },
      startY: 20,
      styles: { cellWidth: 'wrap' },
      columnStyles: {
        0: { cellWidth: 12 }, // Width for photo column
      },
    });

    doc.save('registrants_with_photos.pdf');
  });
};


  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRegistrants.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRegistrants.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="bg-indigo-600 py-4 px-6">
        <h1 className="text-white text-xl font-bold flex items-center">
          <UserCog className="mr-2 h-6 w-6" />
          Admin Dashboard
        </h1>
      </div>

      <div className="p-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search by name, email, or phone"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          </div>
        ) : registrants.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No registrants found. Add some registrants using the registration form.</p>
          </div>
        ) : filteredRegistrants.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No results found for "{searchTerm}"</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Photo
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gender
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      DOB
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.map((registrant) => (
                    <tr key={registrant.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100">
                          {registrant.photoData ? (
                            <img
                              src={registrant.photoData}
                              alt={registrant.fullName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-gray-400">
                              N/A
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{registrant.fullName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{registrant.email}</div>
                        <div className="text-sm text-gray-500">{registrant.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          registrant.gender === 'male' 
                            ? 'bg-blue-100 text-blue-800' 
                            : registrant.gender === 'female' 
                            ? 'bg-pink-100 text-pink-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {registrant.gender.charAt(0).toUpperCase() + registrant.gender.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(registrant.dateOfBirth)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            to={`/admin/edit/${registrant.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Edit className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(registrant.id)}
                            className={`${
                              deleteConfirm === registrant.id
                                ? 'text-red-600 hover:text-red-900'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                          {deleteConfirm === registrant.id && (
                            <button
                              onClick={cancelDelete}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="py-3 flex items-center justify-between border-t border-gray-200 mt-4">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(indexOfLastItem, filteredRegistrants.length)}
                      </span>{' '}
                      of <span className="font-medium">{filteredRegistrants.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => paginate(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === 1
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      
                      {Array.from({ length: totalPages }).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => paginate(index + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border ${
                            currentPage === index + 1
                              ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          } text-sm font-medium`}
                        >
                          {index + 1}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === totalPages
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <button
  onClick={exportToPDF}
  className="mb-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
>
  Export to PDF
</button>
      </div>
    </div>
  );
};