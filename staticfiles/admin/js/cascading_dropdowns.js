(function($) {
    $(document).ready(function() {
        // Function to update college options based on selected university
        function updateColleges(universityId) {
            var $collegeSelect = $('#id_college');
            if (!universityId) {
                $collegeSelect.empty().append('<option value="">---------</option>');
                return;
            }

            // Get colleges for the selected university
            $.ajax({
                url: '/api/colleges/',  // Adjust URL as needed
                data: { university: universityId },
                success: function(data) {
                    $collegeSelect.empty().append('<option value="">---------</option>');
                    data.forEach(function(college) {
                        $collegeSelect.append('<option value="' + college.cid + '">' + college.name_ar + '</option>');
                    });
                }
            });
        }

        // Function to update department options based on selected college
        function updateDepartments(collegeId) {
            var $departmentSelect = $('#id_department');
            if (!collegeId) {
                $departmentSelect.empty().append('<option value="">---------</option>');
                return;
            }

            // Get departments for the selected college
            $.ajax({
                url: '/api/departments/',  // Adjust URL as needed
                data: { college: collegeId },
                success: function(data) {
                    $departmentSelect.empty().append('<option value="">---------</option>');
                    data.forEach(function(department) {
                        $departmentSelect.append('<option value="' + department.department_id + '">' + department.name + '</option>');
                    });
                }
            });
        }

        // Listen for university field changes
        $('#id_university').change(function() {
            var universityId = $(this).val();
            updateColleges(universityId);
            // Reset department when university changes
            $('#id_department').empty().append('<option value="">---------</option>');
        });

        // Listen for college field changes
        $('#id_college').change(function() {
            var collegeId = $(this).val();
            updateDepartments(collegeId);
        });

        // Initialize on page load if values are already selected
        var initialUniversityId = $('#id_university').val();
        if (initialUniversityId) {
            updateColleges(initialUniversityId);
        }

        var initialCollegeId = $('#id_college').val();
        if (initialCollegeId) {
            updateDepartments(initialCollegeId);
        }
    });
})(django.jQuery);