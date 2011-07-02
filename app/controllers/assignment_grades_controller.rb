class AssignmentGradesController < ApplicationController
  # GET /grades
  # GET /grades.json
  def index
    @grades = AssignmentGrade.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @grades }
    end
  end

  # GET /grades/1
  # GET /grades/1.json
  def show
    @grade = AssignmentGrade.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @grade }
    end
  end

  # GET /grades/new
  # GET /grades/new.json
  def new
    @grade = AssignmentGrade.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @grade }
    end
  end

  # GET /grades/1/edit
  def edit
    @grade = AssignmentGrade.find(params[:id])
  end

  # POST /grades
  # POST /grades.json
  def create
    @grade = AssignmentGrade.new(params[:grade])

    respond_to do |format|
      if @grade.save
        format.html { redirect_to @grade, notice: 'Grade was successfully created.' }
        format.json { render json: @grade, status: :created, location: @grade }
      else
        format.html { render action: "new" }
        format.json { render json: @grade.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /grades/1
  # PUT /grades/1.json
  def update
    @grade = AssignmentGrade.find(params[:id])

    respond_to do |format|
      if @grade.update_attributes(params[:grade])
        format.html { redirect_to @grade, notice: 'Grade was successfully updated.' }
        format.json { head :ok }
      else
        format.html { render action: "edit" }
        format.json { render json: @grade.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /grades/1
  # DELETE /grades/1.json
  def destroy
    @grade = AssignmentGrade.find(params[:id])
    @grade.destroy

    respond_to do |format|
      format.html { redirect_to grades_url }
      format.json { head :ok }
    end
  end

  def submit
    @grade = AssignmentGrade.find(params[:id])
    #value returned to datatables to put back into box
    @returned = params[:value]
    puts @grade.value
    @grade.write_attributes(
      value: params[:value],
      graded: true
    )
    @grade.save
    respond_to do |format|
      format.html {render :text => @returned}
      format.js {render :text => @returned}
    end
  end

end
