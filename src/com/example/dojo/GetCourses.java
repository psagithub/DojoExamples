package com.example.dojo;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;

/**
 * Servlet implementation class GetJsonData
 */
@WebServlet("/GetCourses")
public class GetCourses extends HttpServlet {
	private static final long serialVersionUID = 1L;

	private List<Course> courses;

	@Override
	public void init() throws ServletException {
		super.init();

		courses = new ArrayList<Course>(3);
		int studentsCount = 100;
		for (int i = 1; i <= 3; i++) {
			List<Student> students = new ArrayList<Student>(studentsCount);
			for (int j = 1; j <= studentsCount; j++) {
				int id = (i + 1) * studentsCount + j;
				students.add(new Student(id, "Student " + id, j, "student" + id
						+ "@gmail.com"));
			}
			courses.add(new Course(i, "Course-" + i, "English", students));
		}
	}

	public GetCourses() {
		super();
	}

	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		PrintWriter writer = response.getWriter();

		String reqFor = request.getParameter("for");
		if ("select".equals(reqFor)) {
			List<Course> temp = new ArrayList<Course>();
			for (Course course : courses) {
				temp.add(new Course(course.getId(), course.getName(), course
						.getLanguage(), null));
			}
			writer.write("{items:" + new Gson().toJson(temp) + "}");
			return;
		}

		String strCourseId = request.getParameter("courseId");
		if (strCourseId == null) {
			writer.write("{items:" + new Gson().toJson(courses) + "}");
		} else {
			int courseId = Integer.parseInt(strCourseId);
			for (Course course : courses) {
				if (course.getId() == courseId) {
					writer.write("{items:"
							+ new Gson().toJson(course.getStudents()) + "}");
					break;
				}
			}
		}
	}

	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		try {
			int id = Integer.parseInt(request.getParameter("id"));
			String name = request.getParameter("name");
			int age = Integer.parseInt(request.getParameter("age"));
			String email = request.getParameter("email");
			System.out.println(id);
			System.out.println(name);
			System.out.println(age);
			System.out.println(email);

			for (Course course : courses) {
				int i;
				List<Student> students = course.getStudents();
				for (i = 0; i < students.size(); i++) {
					if (students.get(i).getId() == id) {
						students.set(i, new Student(id, name, age, email));
						break;
					}
				}
			}

			response.getWriter()
					.write("Student with ID '" + id
							+ "' has been successfully saved.");
		} catch (Exception e) {
			e.printStackTrace();
			response.getWriter().write("Error: " + e.getMessage());
		}
	}

	public static void main(String[] args) throws ServletException {
		GetCourses getCourses = new GetCourses();
		getCourses.init();
		System.out.println(new Gson().toJson(getCourses.courses));
	}
}
